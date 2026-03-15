import { Injectable, BadRequestException } from '@nestjs/common';
import { load } from 'cheerio';
import { ImportedPropertyData } from './dto/import-property.dto';

@Injectable()
export class PropertyImportService {
  async importFromUrl(url: string): Promise<ImportedPropertyData> {
    let html: string;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      let response: Response;
      try {
        response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache',
            'Upgrade-Insecure-Requests': '1',
          },
          redirect: 'follow',
        });
      } finally {
        clearTimeout(timeoutId);
      }

      html = await this.decodeResponse(response);

      if (!html || html.length < 200) {
        return {
          _warning: 'O site não retornou conteúdo suficiente para extrair dados.',
        };
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw new BadRequestException(
          'A página demorou muito para responder. Tente novamente ou cadastre manualmente.',
        );
      }
      throw new BadRequestException(
        'Não foi possível acessar o link informado. Verifique se a URL está correta.',
      );
    }

    const $ = load(html);
    const result: ImportedPropertyData = {};

    // ── 1. Open Graph tags ────────────────────────────────────────────────────
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogDesc = $('meta[property="og:description"]').attr('content');
    const ogPrice =
      $('meta[property="product:price:amount"]').attr('content') ||
      $('meta[property="og:price:amount"]').attr('content');

    const ogImages: string[] = [];
    $('meta[property="og:image"], meta[property="og:image:url"]').each((_, el) => {
      const c = $(el).attr('content');
      if (c?.startsWith('http')) ogImages.push(c);
    });

    // ── 2. Meta tags convencionais ────────────────────────────────────────────
    const metaTitle = $('meta[name="title"]').attr('content');
    const metaDesc = $('meta[name="description"]').attr('content');

    // ── 3. JSON-LD ────────────────────────────────────────────────────────────
    const jsonLdData = this.extractJsonLd($);

    // ── 4. Script tags com dados de hidratação (React/Vue/Angular SPAs) ───────
    const scriptData = this.extractFromScripts($);

    // ── 5. Corpo da página (para sites server-rendered) ───────────────────────
    const bodyText = $('body').text();

    // ── Montar título ─────────────────────────────────────────────────────────
    result.title =
      jsonLdData.title ||
      scriptData.title ||
      ogTitle ||
      metaTitle ||
      this.extractTitleFromH1($) ||
      this.cleanPageTitle($('title').text()) ||
      undefined;

    if (result.title) result.title = result.title.trim().slice(0, 200);

    // ── Montar descrição ──────────────────────────────────────────────────────
    result.description =
      jsonLdData.description ||
      scriptData.description ||
      ogDesc ||
      metaDesc ||
      undefined;

    if (result.description) result.description = result.description.trim().slice(0, 2000);

    // ── Montar preço ──────────────────────────────────────────────────────────
    result.price =
      jsonLdData.price ||
      scriptData.price ||
      (ogPrice ? this.parsePrice(ogPrice) : undefined) ||
      this.extractPriceFromDom($) ||
      this.extractPriceFromText(bodyText);

    // ── Montar localização ────────────────────────────────────────────────────
    result.city = jsonLdData.city || scriptData.city || this.extractCityFromPage($, url);
    result.neighborhood =
      jsonLdData.neighborhood ||
      scriptData.neighborhood ||
      this.extractNeighborhoodFromPage($, result.city);
    result.state = jsonLdData.state || scriptData.state || this.extractStateFromPage($, url);

    // ── Tipo do imóvel ────────────────────────────────────────────────────────
    result.type = jsonLdData.type || scriptData.type || this.extractTypeFromPage($, url);

    // ── Montar características ────────────────────────────────────────────────
    result.bedrooms =
      jsonLdData.bedrooms || scriptData.bedrooms || this.extractNumber(bodyText, [
        /(\d+)\s*(?:quarto|dormit[oó]rio|suite|suíte)/i,
        /(?:quarto|dorm|suite|suíte)[s]?\s*:?\s*(\d+)/i,
      ]);

    result.bathrooms =
      jsonLdData.bathrooms || scriptData.bathrooms || this.extractNumber(bodyText, [
        /(\d+)\s*(?:banheiro|wc|lavabo)/i,
        /(?:banheiro|wc)[s]?\s*:?\s*(\d+)/i,
      ]);

    result.areaM2 =
      jsonLdData.areaM2 || scriptData.areaM2 || this.extractArea(bodyText);

    // ── Fotos ─────────────────────────────────────────────────────────────────
    const photos = [...ogImages, ...this.extractImagesFromDom($)];
    result.photos = [...new Set(photos)].slice(0, 10);

    // ── Descrição do corpo da página ──────────────────────────────────────────
    if (!result.description) {
      result.description = this.extractDescriptionFromDom($);
    }

    // ── Fallback: varre todos os scripts buscando R$ ─────────────────────────
    if (!result.price) {
      result.price = this.extractPriceFromAllScripts($);
    }

    // ── Fallback descrição: maior bloco de texto fora de nav/header/footer ───
    if (!result.description) {
      result.description = this.extractDescriptionFallback($);
    }

    // ── Aviso se site usa JS rendering ───────────────────────────────────────
    const hasUsefulData = [
      result.title, result.price, result.bedrooms, result.areaM2,
    ].some(Boolean);

    if (!hasUsefulData) {
      result._warning =
        'Este site carrega os dados via JavaScript. Apenas informações básicas foram extraídas. Complete os campos manualmente.';
    }

    return result;
  }

  // ── Decodificação com charset correto ────────────────────────────────────
  private async decodeResponse(response: Response): Promise<string> {
    const buffer = await response.arrayBuffer();

    // 1) Charset do header Content-Type
    const contentType = response.headers.get('content-type') || '';
    const headerCharset = contentType.match(/charset=["']?([\w-]+)/i)?.[1];

    // Decodifica com o charset do header (ou UTF-8 como padrão)
    let charset = this.normalizeCharset(headerCharset || 'utf-8');
    let html = new TextDecoder(charset).decode(buffer);

    // 2) Verifica o charset declarado no próprio HTML (meta charset ou http-equiv)
    const metaMatch =
      html.match(/<meta[^>]+charset=["']?([\w-]+)/i) ||
      html.match(/<meta[^>]+content=["'][^"']*charset=([\w-]+)/i);

    if (metaMatch) {
      const metaCharset = this.normalizeCharset(metaMatch[1]);
      if (metaCharset !== charset) {
        // Redecodifica com o charset correto informado pelo HTML
        charset = metaCharset;
        html = new TextDecoder(charset).decode(buffer);
      }
    }

    return html;
  }

  // Resolve \uXXXX e \xXX em strings extraídas de script tags
  private unescapeString(str: string): string {
    return str
      .replace(/\\u([0-9a-fA-F]{4})/gi, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16)),
      )
      .replace(/\\x([0-9a-fA-F]{2})/gi, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16)),
      )
      .replace(/\\n/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\\r/g, '')
      .trim();
  }

  private normalizeCharset(raw: string): string {
    const lower = raw.toLowerCase().trim();
    // Aliases comuns de sites brasileiros
    const aliases: Record<string, string> = {
      'iso-8859-1': 'windows-1252', // windows-1252 é superset do latin-1
      'latin-1': 'windows-1252',
      'latin1': 'windows-1252',
      'iso8859-1': 'windows-1252',
      'iso_8859-1': 'windows-1252',
      'cp1252': 'windows-1252',
      'x-sjis': 'shift_jis',
    };
    return aliases[lower] || lower;
  }

  // ── JSON-LD ──────────────────────────────────────────────────────────────
  private extractJsonLd($: ReturnType<typeof load>): Partial<ImportedPropertyData> {
    const data: Partial<ImportedPropertyData> = {};

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || '{}');
        const items: any[] = Array.isArray(json) ? json : [json];

        for (const item of items) {
          if (!data.title && item.name) data.title = String(item.name).trim();
          if (!data.description && item.description)
            data.description = String(item.description).trim();

          const price = item.offers?.price ?? item.price ?? item.offers?.lowPrice;
          if (!data.price && price) {
            const p = this.parsePrice(String(price));
            if (p) data.price = p;
          }

          const addr = item.address ?? item.location?.address;
          if (addr) {
            if (!data.city && addr.addressLocality)
              data.city = String(addr.addressLocality);
            if (!data.neighborhood && (addr.addressRegion || addr.streetAddress))
              data.neighborhood = String(addr.addressRegion ?? addr.streetAddress);
          }

          if (!data.bedrooms && item.numberOfRooms)
            data.bedrooms = parseInt(item.numberOfRooms);
          if (!data.areaM2 && item.floorSize?.value)
            data.areaM2 = parseFloat(item.floorSize.value);
        }
      } catch { /* ignorar JSON malformado */ }
    });

    return data;
  }

  // ── Busca JSON de hidratação em <script> tags ────────────────────────────
  private extractFromScripts($: ReturnType<typeof load>): Partial<ImportedPropertyData> {
    const data: Partial<ImportedPropertyData> = {};
    const patterns = [
      // window.__NUXT__, window.__INITIAL_STATE__, __NEXT_DATA__, etc.
      /__(?:NUXT|INITIAL_STATE|NEXT_DATA|APP_STATE|STORE_STATE|REDUX_STATE)__\s*=\s*(\{.+)/,
      /window\.__data__\s*=\s*(\{.+)/,
      /var\s+(?:imovel|property|produto|listing)\s*=\s*(\{.+)/i,
      /"imovel"\s*:\s*(\{[^<]+\})/,
      /"property"\s*:\s*(\{[^<]+\})/,
      /"listing"\s*:\s*(\{[^<]+\})/,
    ];

    $('script:not([src]):not([type="application/ld+json"])').each((_, el) => {
      const src = $(el).html() || '';
      if (src.length > 50000) return; // ignorar bundles grandes

      // Tenta extrair campos diretamente por regex no script
      // Campos específicos de preço de venda — evita maxPrice, valorMinimo, valorCondominio, etc.
      if (!data.price) {
        const m = src.match(
          /"(?:preco_venda|valor_venda|sale_price|listing_price|asking_price|sellingPrice|priceValue)\s*"\s*:\s*"?(\d[\d.,]+)"?/i,
        );
        if (m) {
          const p = this.parsePrice(m[1]);
          if (p) data.price = p;
        }
      }

      if (!data.title) {
        const m = src.match(/"(?:title|titulo|nome|descricao_titulo)"\s*:\s*"([^"]{10,200})"/i);
        if (m) data.title = this.unescapeString(m[1]);
      }

      if (!data.city) {
        const m = src.match(/"(?:city|cidade|municipio)"\s*:\s*"([^"]{2,80})"/i);
        if (m) data.city = this.unescapeString(m[1]);
      }

      if (!data.neighborhood) {
        const m = src.match(/"(?:neighborhood|bairro)"\s*:\s*"([^"]{2,80})"/i);
        if (m) data.neighborhood = this.unescapeString(m[1]);
      }

      if (!data.bedrooms) {
        const m = src.match(/"(?:bedrooms|quartos|dormitorios|dorms)"\s*:\s*(\d+)/i);
        if (m) data.bedrooms = parseInt(m[1]);
      }

      if (!data.bathrooms) {
        const m = src.match(/"(?:bathrooms|banheiros|wc)"\s*:\s*(\d+)/i);
        if (m) data.bathrooms = parseInt(m[1]);
      }

      if (!data.areaM2) {
        const m = src.match(/"(?:area|area_total|area_util|area_m2|areaM2)"\s*:\s*"?(\d[\d.,]*)"?/i);
        if (m) {
          const a = parseFloat(m[1].replace(',', '.'));
          if (!isNaN(a) && a >= 5) data.areaM2 = a;
        }
      }

      // Tenta parsear JSON completo
      if (!data.price || !data.city) {
        for (const pattern of patterns) {
          try {
            const match = src.match(pattern);
            if (!match) continue;
            // Tenta pegar o objeto JSON completo
            const jsonStr = this.extractJsonObject(match[1] || match[0]);
            if (!jsonStr) continue;
            const obj = JSON.parse(jsonStr);
            this.mergePropertyData(data, obj);
          } catch { /* ignorar */ }
        }
      }
    });

    return data;
  }

  // ── DOM-based price extractor ────────────────────────────────────────────
  private extractPriceFromDom($: ReturnType<typeof load>): number | undefined {
    const selectors = [
      '[class*="price"]', '[class*="preco"]', '[class*="valor"]',
      '[class*="Price"]', '[class*="Preco"]', '[class*="Valor"]',
      '[id*="price"]', '[id*="preco"]', '[id*="valor"]',
      'span[itemprop="price"]', '[data-price]',
    ];

    for (const sel of selectors) {
      try {
        const text = $(sel).first().text();
        if (!text) continue;
        const p = this.extractPriceFromText(text);
        if (p) return p;

        // data-price attribute
        const dp = $(sel).first().attr('data-price');
        if (dp) {
          const p2 = this.parsePrice(dp);
          if (p2) return p2;
        }
      } catch { /* ignorar */ }
    }
    return undefined;
  }

  // ── Imagens do DOM ───────────────────────────────────────────────────────
  private extractImagesFromDom($: ReturnType<typeof load>): string[] {
    const imgs: string[] = [];
    const attrs = ['src', 'data-src', 'data-lazy-src', 'data-original', 'data-full'];

    $('img').each((_, el) => {
      for (const attr of attrs) {
        const src = $(el).attr(attr);
        if (!src || !src.startsWith('http')) continue;
        const w = parseInt($(el).attr('width') || '0');
        const srcL = src.toLowerCase();
        if (
          w > 300 ||
          /foto|photo|imov|apart|casa|imovel|galeria|gallery|listing|property/.test(srcL)
        ) {
          imgs.push(src);
          break;
        }
      }
    });

    return imgs;
  }

  // ── Extrai título do H1 ignorando elementos de nav ───────────────────────
  private extractTitleFromH1($: ReturnType<typeof load>): string | undefined {
    let title: string | undefined;
    $('h1').each((_, el) => {
      const t = $(el).text().trim();
      if (t && t.length > 5 && t.length < 200) { title = t; return false; }
    });
    return title;
  }

  // ── Limpa o title da página removendo o nome do site ────────────────────
  private cleanPageTitle(raw: string): string | undefined {
    if (!raw) return undefined;
    // Remove separadores comuns e o que vem depois
    const parts = raw.split(/\s*[-|–|·|»|>]\s*/);
    const cleaned = parts[0]?.trim();
    if (!cleaned || cleaned.length < 5) return undefined;
    // Ignorar títulos genéricos
    if (/^(home|inicio|início|detalhes|imovel|imóvel)$/i.test(cleaned)) return undefined;
    return cleaned.slice(0, 200);
  }

  // ── Extrai cidade de breadcrumb, title ou meta ───────────────────────────
  private extractCityFromPage($: ReturnType<typeof load>, url: string): string | undefined {
    // Breadcrumbs
    const crumbSelectors = [
      '[class*="breadcrumb"]', '[class*="Breadcrumb"]',
      'nav[aria-label*="breadcrumb"]', '.bread', '#breadcrumb',
    ];
    for (const sel of crumbSelectors) {
      try {
        const text = $(sel).text();
        if (text) {
          const m = text.match(/([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú]?[a-zà-ú]+)*)\s*\/?\s*(?:BA|SP|RJ|MG|RS|PR|SC|PE|CE|GO|DF)/);
          if (m) return m[1].trim();
        }
      } catch { /* ignorar */ }
    }

    // Title da página
    const pageTitle = $('title').text();
    const cityFromTitle = pageTitle.match(
      /em\s+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[a-zà-ú]+)*)\s*[-–,]/i,
    );
    if (cityFromTitle) return cityFromTitle[1].trim();

    // Meta keywords/geo
    const geo = $('meta[name="geo.placename"]').attr('content');
    if (geo) return geo.split(',')[0]?.trim();

    return undefined;
  }

  // ── Extrai estado (UF) ────────────────────────────────────────────────────
  private extractStateFromPage($: ReturnType<typeof load>, url: string): string | undefined {
    const STATE_MAP: Record<string, string> = {
      acre: 'AC', alagoas: 'AL', amapá: 'AP', amapa: 'AP', amazonas: 'AM',
      bahia: 'BA', ceará: 'CE', ceara: 'CE', 'distrito federal': 'DF',
      'espírito santo': 'ES', 'espirito santo': 'ES', goiás: 'GO', goias: 'GO',
      maranhão: 'MA', maranhao: 'MA', 'mato grosso do sul': 'MS',
      'mato grosso': 'MT', 'minas gerais': 'MG', pará: 'PA', para: 'PA',
      paraíba: 'PB', paraiba: 'PB', paraná: 'PR', parana: 'PR',
      pernambuco: 'PE', piauí: 'PI', piaui: 'PI', 'rio de janeiro': 'RJ',
      'rio grande do norte': 'RN', 'rio grande do sul': 'RS',
      rondônia: 'RO', rondonia: 'RO', roraima: 'RR',
      'santa catarina': 'SC', 'são paulo': 'SP', 'sao paulo': 'SP',
      sergipe: 'SE', tocantins: 'TO',
    };

    // Abreviação direta na página
    const sources = [
      $('meta[name="geo.region"]').attr('content') || '',
      $('title').text(),
      $('[class*="breadcrumb"], [class*="Breadcrumb"]').text(),
      $('[itemprop="addressRegion"]').first().text(),
      url,
    ];

    for (const src of sources) {
      // Sigla de 2 letras (AC, SP, BA…)
      const sigla = src.match(/\b(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/);
      if (sigla) return sigla[1];
    }

    // Nome por extenso no título da página
    const titleText = $('title').text().toLowerCase();
    for (const [name, uf] of Object.entries(STATE_MAP)) {
      if (titleText.includes(name)) return uf;
    }

    return undefined;
  }

  // ── Detecta tipo do imóvel via URL / título / H1 ──────────────────────────
  private extractTypeFromPage($: ReturnType<typeof load>, url: string): string | undefined {
    const TYPE_MAP: Array<[RegExp, string]> = [
      [/\b(terreno|lote|gleba)\b/i, 'LAND'],
      [/\b(sala|loja|comercial|galpão|galpao|predio|prédio)\b/i, 'COMMERCIAL'],
      [/\b(fazenda|chácara|chacara|sítio|sitio|rural)\b/i, 'RURAL'],
      [/\b(casa\s+em\s+condom[ií]nio|casa\s+condom[ií]nio)\b/i, 'HOUSE'],
      [/\b(apartamento|apto|flat|cobertura|studio|kitnet|kitinete)\b/i, 'APARTMENT'],
      [/\b(casa|sobrado|vila|mansão|mansao)\b/i, 'HOUSE'],
    ];

    const sources = [
      decodeURIComponent(url),
      $('title').text(),
      $('h1').first().text(),
      $('meta[property="og:title"]').attr('content') || '',
      $('[class*="breadcrumb"], [class*="tipo"], [class*="type"]').text(),
    ].join(' ');

    for (const [regex, type] of TYPE_MAP) {
      if (regex.test(sources)) return type;
    }

    return undefined;
  }

  // ── Varre TODOS os scripts buscando padrão R$ como último recurso ─────────
  private extractPriceFromAllScripts($: ReturnType<typeof load>): number | undefined {
    const candidates: number[] = [];

    $('script:not([src])').each((_, el) => {
      const src = $(el).html() || '';
      // Busca padrão R$ dentro de strings JavaScript
      const matches = src.matchAll(/["'`]R\$\s*([\d.]+(?:,\d{2})?)/g);
      for (const m of matches) {
        const p = this.parsePrice(m[1]);
        // Faixa realista de imóvel no Brasil: R$30k a R$50M
        if (p && p >= 30000 && p <= 50000000) candidates.push(p);
      }
      // Também tenta o padrão sem aspas (valor em JSON ou variável JS)
      const matches2 = src.matchAll(/"valor[^"]*"\s*:\s*"?([\d.]+(?:,\d{2})?)"?/gi);
      for (const m of matches2) {
        const key = m[0].toLowerCase();
        // Pula campos de filtro, condomínio, IPTU etc.
        if (/max|min|cond|iptu|taxa|filter|total/.test(key)) continue;
        const p = this.parsePrice(m[1]);
        if (p && p >= 30000 && p <= 50000000) candidates.push(p);
      }
    });

    if (candidates.length === 0) return undefined;

    // Se há vários candidatos, descarta outliers e pega o mais frequente ou mediano
    candidates.sort((a, b) => a - b);
    return candidates[Math.floor(candidates.length / 2)]; // mediana
  }

  // ── Descrição fallback: maior bloco de texto fora de nav/header/footer ────
  private extractDescriptionFallback($: ReturnType<typeof load>): string | undefined {
    // Remove elementos de navegação e estrutura para não capturar menus
    const $clone = $('body').clone();
    $clone.find('nav, header, footer, script, style, [class*="menu"], [class*="nav"], [class*="header"], [class*="footer"], [class*="breadcrumb"]').remove();

    let best = '';

    // Tenta elementos de texto com conteúdo substancial
    $clone.find('p, [class*="descri"], [class*="observ"], [class*="detail"], [class*="sobre"], [class*="texto"], [class*="info"]').each((_, el) => {
      const t = $(el).text().replace(/\s+/g, ' ').trim();
      if (t.length > best.length && t.length >= 60 && t.length <= 3000) {
        best = t;
      }
    });

    // Fallback: div com texto longo
    if (best.length < 60) {
      $clone.find('div').each((_, el) => {
        // Só pega o texto direto, não de filhos com muitos elementos
        const children = $(el).children().length;
        if (children > 5) return;
        const t = $(el).text().replace(/\s+/g, ' ').trim();
        if (t.length > best.length && t.length >= 80 && t.length <= 2000) {
          best = t;
        }
      });
    }

    return best.length >= 60 ? best.slice(0, 2000) : undefined;
  }

  // ── Extrai descrição do corpo da página ───────────────────────────────────
  private extractDescriptionFromDom($: ReturnType<typeof load>): string | undefined {
    const selectors = [
      '[class*="descri"]', '[class*="Descri"]', '[class*="description"]',
      '[class*="observ"]', '[class*="detail"]', '[class*="sobre"]',
      '[itemprop="description"]', '[data-testid*="description"]',
    ];

    for (const sel of selectors) {
      try {
        const el = $(sel).first();
        const text = el.text().trim();
        if (text && text.length > 40 && text.length < 3000) return text.slice(0, 2000);
      } catch { /* ignorar */ }
    }

    // Fallback: maior parágrafo dentro do main/article
    let best = '';
    $('main p, article p, [role="main"] p').each((_, el) => {
      const t = $(el).text().trim();
      if (t.length > best.length && t.length > 80 && t.length < 2000) best = t;
    });

    return best || undefined;
  }

  // ── Extrai bairro ─────────────────────────────────────────────────────────
  private extractNeighborhoodFromPage(
    $: ReturnType<typeof load>,
    city?: string,
  ): string | undefined {
    // 1) Seletores semânticos diretos
    const directSelectors = [
      '[class*="bairro"]', '[class*="neighborhood"]', '[class*="district"]',
      '[itemprop="addressLocality"]', '[data-bairro]',
    ];
    for (const sel of directSelectors) {
      try {
        const t = $(sel).first().text().trim();
        if (t && t.length >= 2 && t.length < 80) return t;
      } catch { /* ignorar */ }
    }

    // 2) Breadcrumb: item imediatamente após a cidade conhecida
    // Padrão: "... > Feira de Santana > Registro" → "Registro"
    if (city) {
      const crumbSels = [
        '[class*="breadcrumb"] a', '[class*="Breadcrumb"] a',
        'nav a', '.bread a', '[aria-label*="breadcrumb"] a',
        '[class*="breadcrumb"] span', '[class*="breadcrumb"] li',
      ];
      for (const sel of crumbSels) {
        try {
          const items = $(sel).map((_, el) => $(el).text().trim()).get();
          const cityIdx = items.findIndex(
            (t) => t.toLowerCase().includes(city.toLowerCase()),
          );
          if (cityIdx !== -1 && cityIdx + 1 < items.length) {
            const candidate = items[cityIdx + 1].trim();
            if (candidate.length >= 2 && candidate.length < 80) return candidate;
          }
        } catch { /* ignorar */ }
      }
    }

    // 3) Texto no formato "Bairro, Cidade" ou "Bairro - Cidade"
    // Procura em elementos de localização comuns
    const locationSels = [
      '[class*="local"]', '[class*="endereco"]', '[class*="address"]',
      '[class*="locali"]', '[itemprop="address"]',
    ];
    for (const sel of locationSels) {
      try {
        const text = $(sel).first().text().trim();
        if (!text || !city) continue;
        // Padrão: "Registro, Feira de Santana" — pega o que vem antes da cidade
        const cityEscaped = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const m = text.match(new RegExp(`([^,/\\-]+)\\s*[,/\\-]\\s*${cityEscaped}`, 'i'));
        if (m) {
          const candidate = m[1].trim();
          if (candidate.length >= 2 && candidate.length < 80) return candidate;
        }
      } catch { /* ignorar */ }
    }

    // 4) Corpo do texto: padrão "Bairro: Registro" ou "Bairro Registro"
    const bodyText = $('body').text();
    const labelMatch = bodyText.match(/\bbairro\s*:?\s*([A-ZÀ-Ú][a-zA-ZÀ-ÿ\s]{2,40}?)(?=\s*[,\n\r]|\s+cidade|\s+em\s)/i);
    if (labelMatch) return labelMatch[1].trim();

    return undefined;
  }

  // ── Utilitários ───────────────────────────────────────────────────────────
  private parsePrice(raw: string): number | undefined {
    const cleaned = raw.replace(/[^\d.,]/g, '');
    if (!cleaned) return undefined;
    // Remove pontos de milhar e converte vírgula decimal
    const normalized = cleaned.replace(/\.(?=\d{3}(?:[,.]|$))/g, '').replace(',', '.');
    const val = parseFloat(normalized);
    return !isNaN(val) && val >= 10000 ? val : undefined;
  }

  private extractPriceFromText(text: string): number | undefined {
    const m = text.match(/R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d{4,}(?:,\d{2})?)/);
    if (!m) return undefined;
    return this.parsePrice(m[1]);
  }

  private extractArea(text: string): number | undefined {
    // Prioriza área privativa/útil sobre total quando ambas presentes
    const patterns = [
      /área\s+(?:privativa|útil|construída)[^0-9]*(\d+(?:[.,]\d+)?)\s*m[²2]/i,
      /(\d+(?:[.,]\d+)?)\s*m[²2]\s*(?:de\s+)?(?:área|construção|construída|privativa|útil)/i,
      /(\d+(?:[.,]\d+)?)\s*m[²2]/i,
    ];
    for (const pattern of patterns) {
      const m = text.match(pattern);
      if (m) {
        const val = parseFloat(m[1].replace(',', '.'));
        if (!isNaN(val) && val >= 5) return val;
      }
    }
    return undefined;
  }

  private extractNumber(text: string, patterns: RegExp[]): number | undefined {
    for (const p of patterns) {
      const m = text.match(p);
      if (m) return parseInt(m[1] ?? m[2]);
    }
    return undefined;
  }

  // Tenta extrair um objeto JSON completo a partir de uma posição no texto
  private extractJsonObject(text: string): string | null {
    if (!text.startsWith('{')) return null;
    let depth = 0;
    let i = 0;
    for (; i < Math.min(text.length, 5000); i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') { depth--; if (depth === 0) return text.slice(0, i + 1); }
    }
    return null;
  }

  // Tenta mapear campos genéricos de um JSON para campos de imóvel
  private mergePropertyData(target: Partial<ImportedPropertyData>, obj: any) {
    if (!obj || typeof obj !== 'object') return;
    const flat = this.flattenObject(obj);

    for (const [key, val] of Object.entries(flat)) {
      const k = key.toLowerCase();
      if (!target.title && /^(title|titulo|nome)$/.test(k) && typeof val === 'string')
        target.title = this.unescapeString(val);
      // Apenas campos específicos de preço de venda (evita max, min, condomínio, IPTU etc.)
      if (!target.price) {
        const leaf = k.split('.').pop() || '';
        const isSalePrice = /^(price|preco_venda|valor_venda|sale_price|listing_price|sellingPrice|priceValue|venda_valor)$/i.test(leaf);
        const isNotFilter = !/max|min|filter|cond|iptu|total|from|to|taxa/i.test(leaf);
        if (isSalePrice && isNotFilter) {
          const p = this.parsePrice(String(val));
          if (p) target.price = p;
        }
      }
      if (!target.city && /city|cidade|municipio/.test(k) && typeof val === 'string')
        target.city = this.unescapeString(val);
      if (!target.state && /state|estado|uf/.test(k) && typeof val === 'string')
        target.state = val.length === 2 ? val.toUpperCase() : undefined;
      if (!target.neighborhood && /neighborhood|bairro/.test(k) && typeof val === 'string')
        target.neighborhood = this.unescapeString(val);
      if (!target.bedrooms && /bedroom|quarto|dormit/.test(k))
        target.bedrooms = parseInt(String(val)) || undefined;
      if (!target.bathrooms && /bathroom|banheiro/.test(k))
        target.bathrooms = parseInt(String(val)) || undefined;
      if (!target.areaM2 && /area|m2|metragem/.test(k)) {
        const a = parseFloat(String(val).replace(',', '.'));
        if (!isNaN(a) && a >= 5) target.areaM2 = a;
      }
    }
  }

  private flattenObject(obj: any, prefix = '', result: Record<string, any> = {}): Record<string, any> {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return result;
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        this.flattenObject(v, key, result);
      } else {
        result[key] = v;
      }
    }
    return result;
  }
}
