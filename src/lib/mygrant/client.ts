export const MYGRANT_USER_AGENT = 'PinkAutoGlass-OMS/1.0 (+https://pinkautoglass.com; doug@pinkautoglass.com)';

const DEFAULT_STAGING_URL = 'https://webservice-staging.mygrantglass.com/v2/CoRE650WebService.asmx';
const DEFAULT_PRODUCTION_URL = 'https://webservice.mygrantglass.com/v2/CoRE650WebService.asmx';

export type MygrantEnvironment = 'TEST' | 'PROD';
export type MygrantRequestType = 'Inquiry' | 'Order' | 'Return';
export type MygrantDeliveryMethod = 'ScheduleRun' | 'WillCall';

export interface MygrantConfig {
  authToken: string;
  customerId: string;
  webUserId: string;
  password: string;
  customerContact?: string;
  environment: MygrantEnvironment;
  baseUrl: string;
}

export interface MygrantNagsInquiryItem {
  requestItemNo?: number;
  nagsPrefix: string;
  nagsNumber: string;
  quantity?: number;
  nagsColor?: string;
  hardwareIndicator?: 'Y' | 'N';
  premiumIndicator?: 'P' | 'N';
  brand?: string;
  shipFromBranchId?: string;
  deliveryMethod?: MygrantDeliveryMethod;
  deliveryDate?: string;
  deliveryTime?: string;
}

export interface MygrantProductInquiryItem {
  requestItemNo?: number;
  productId: string;
  brand: string;
  quantity?: number;
  shipFromBranchId?: string;
  deliveryMethod?: MygrantDeliveryMethod;
  deliveryDate?: string;
  deliveryTime?: string;
}

export interface MygrantVehicleInquiryItem {
  requestItemNo?: number;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  quantity?: number;
  shipFromBranchId?: string;
  deliveryMethod?: MygrantDeliveryMethod;
}

export interface MygrantResponseItem {
  responseItemNo?: number;
  productType?: string;
  nagsPrefix?: string;
  nagsNumber?: string;
  nagsColor?: string;
  hardwareIndicator?: string;
  premiumIndicator?: string;
  productId?: string;
  brand?: string;
  qtyAvailable?: number;
  estimatedDeliveryDate?: string;
  estimatedDeliveryTime?: string;
  truckRun?: string;
  nextDepartingDate?: string;
  nextDepartingTime?: string;
  shipFromBranchId?: string;
  shipFromBranchName?: string;
  drLineNo?: string;
  listUnitPrice?: number;
  customerUnitPrice?: number;
  pricingCommitment?: string;
  nextDepartingRoute?: string;
  part?: string;
  partDesc?: string;
  notes?: string;
  code?: string;
  rawXml: string;
}

export interface MygrantRequestItemResponse {
  requestItemNo?: number;
  requestDetailXml: string;
  responses: MygrantResponseItem[];
}

export interface MygrantParsedResponse {
  requestStatusCode?: string;
  requestStatusText?: string;
  requestItems: MygrantRequestItemResponse[];
  rawSoap: string;
  rawInnerXml: string;
}

type FetchLike = typeof fetch;

export class MygrantClient {
  private readonly config: MygrantConfig;
  private readonly fetchImpl: FetchLike;

  constructor(config: MygrantConfig, fetchImpl: FetchLike = fetch) {
    this.config = config;
    this.fetchImpl = fetchImpl;
  }

  async inquireByNags(items: MygrantNagsInquiryItem[], opportunityId?: string): Promise<MygrantParsedResponse> {
    return this.inquire(items.map((item, index) => nagsItemXml(item, index + 1)).join(''), opportunityId);
  }

  async inquireByProducts(items: MygrantProductInquiryItem[], opportunityId?: string): Promise<MygrantParsedResponse> {
    return this.inquire(items.map((item, index) => productItemXml(item, index + 1)).join(''), opportunityId);
  }

  /**
   * Exploratory only. Mygrant's 2026-03-17 spec shows RequestVehicle* fields in
   * response detail, but does not document a vehicle inquiry request format.
   * Use the smoke script to confirm whether this works before relying on it.
   */
  async inquireByVehicle(items: MygrantVehicleInquiryItem[], opportunityId?: string): Promise<MygrantParsedResponse> {
    return this.inquire(items.map((item, index) => vehicleItemXml(item, index + 1)).join(''), opportunityId);
  }

  private async inquire(requestItemsXml: string, opportunityId?: string): Promise<MygrantParsedResponse> {
    return this.send('Inquiry', requestItemsXml, opportunityId);
  }

  private async send(
    requestType: MygrantRequestType,
    requestItemsXml: string,
    opportunityId?: string
  ): Promise<MygrantParsedResponse> {
    // Mygrant requires credentials inside the XML body. Never log the inner XML
    // or SOAP envelope without first masking <Password> and AuthToken values.
    const innerXml = buildMygrantRequestXml(this.config, requestType, requestItemsXml, opportunityId);
    const soapXml = buildSoapEnvelope(innerXml);
    const signal = AbortSignal.timeout(12_000);

    const response = await this.fetchImpl(this.config.baseUrl, {
      method: 'POST',
      headers: {
        Accept: 'text/xml, application/xml',
        'Accept-Encoding': 'gzip,deflate',
        AuthToken: this.config.authToken,
        'Content-Type': 'text/xml;charset=UTF-8',
        SOAPAction: '"http://tempuri.org/InboundTraffic"',
        'User-Agent': MYGRANT_USER_AGENT,
      },
      body: soapXml,
      signal,
    });

    const rawSoap = await response.text();
    if (!response.ok) {
      throw new Error(`Mygrant SOAP request failed: HTTP ${response.status} ${response.statusText} ${rawSoap.slice(0, 500)}`);
    }

    return parseMygrantSoapResponse(rawSoap);
  }
}

export function getMygrantConfigFromEnv(): MygrantConfig {
  const environment = normalizeEnvironment(process.env.MYGRANT_ENVIRONMENT);
  const baseUrl = process.env.MYGRANT_BASE_URL || (environment === 'PROD' ? DEFAULT_PRODUCTION_URL : DEFAULT_STAGING_URL);

  return {
    authToken: requiredEnv('MYGRANT_AUTH_TOKEN'),
    customerId: requiredEnv('MYGRANT_CUSTOMER_ID'),
    webUserId: requiredEnv('MYGRANT_WEB_USER_ID'),
    password: requiredEnv('MYGRANT_PASSWORD'),
    customerContact: process.env.MYGRANT_CUSTOMER_CONTACT || undefined,
    environment,
    baseUrl,
  };
}

export function getMygrantClient(fetchImpl: FetchLike = fetch): MygrantClient {
  return new MygrantClient(getMygrantConfigFromEnv(), fetchImpl);
}

export function parseMygrantSoapResponse(rawSoap: string): MygrantParsedResponse {
  const rawInnerXml = extractSoapResult(rawSoap);
  const requestItems = matchBlocks(rawInnerXml, 'RequestItem').map(block => ({
    requestItemNo: parseOptionalInt(extractTag(block, 'RequestItemNo')),
    requestDetailXml: extractBlock(block, 'RequestDetail') || '',
    responses: matchBlocks(block, 'Response').map(parseResponseItem),
  }));

  return {
    requestStatusCode: extractTag(rawInnerXml, 'RequestStatusCode'),
    requestStatusText: extractTag(rawInnerXml, 'RequestStatusText'),
    requestItems,
    rawSoap,
    rawInnerXml,
  };
}

function buildMygrantRequestXml(
  config: MygrantConfig,
  requestType: MygrantRequestType,
  requestItemsXml: string,
  opportunityId?: string
): string {
  return [
    '<MygrantXMLOrderingSystemRequest>',
    '<RequestHeader>',
    tag('EnvironmentID', config.environment),
    tag('CustomerID', config.customerId),
    tag('CustomerContact', config.customerContact || ''),
    tag('WebUserID', config.webUserId),
    tag('Password', config.password),
    tag('RequestType', requestType),
    tag('VersionNumber', '1.0'),
    opportunityId ? tag('OpportunityID', opportunityId) : '',
    '</RequestHeader>',
    '<RequestSet>',
    requestItemsXml,
    '</RequestSet>',
    '</MygrantXMLOrderingSystemRequest>',
  ].join('');
}

function buildSoapEnvelope(innerXml: string): string {
  return [
    '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">',
    '<soapenv:Header/>',
    '<soapenv:Body>',
    '<tem:InboundTraffic>',
    '<tem:request><![CDATA[',
    innerXml,
    ']]></tem:request>',
    '</tem:InboundTraffic>',
    '</soapenv:Body>',
    '</soapenv:Envelope>',
  ].join('');
}

function nagsItemXml(item: MygrantNagsInquiryItem, defaultItemNo: number): string {
  return requestItemXml(item.requestItemNo || defaultItemNo, [
    tag('RequestNAGSPrefix', item.nagsPrefix),
    tag('RequestNAGSNumber', item.nagsNumber),
    optionalTag('RequestNAGSColor', item.nagsColor),
    optionalTag('RequestNAGSHardwareIndicator', item.hardwareIndicator),
    optionalTag('RequestNAGSPremiumIndicator', item.premiumIndicator),
    optionalTag('RequestBrand', item.brand),
    tag('RequestQuantity', item.quantity || 1),
    optionalTag('RequestShipFromBranchID', item.shipFromBranchId),
    optionalTag('RequestDeliveryMethod', item.deliveryMethod),
    optionalTag('RequestDeliveryDate', item.deliveryDate),
    optionalTag('RequestDeliveryTime', item.deliveryTime),
  ]);
}

function productItemXml(item: MygrantProductInquiryItem, defaultItemNo: number): string {
  return requestItemXml(item.requestItemNo || defaultItemNo, [
    tag('RequestProductID', item.productId),
    tag('RequestBrand', item.brand),
    tag('RequestQuantity', item.quantity || 1),
    optionalTag('RequestShipFromBranchID', item.shipFromBranchId),
    optionalTag('RequestDeliveryMethod', item.deliveryMethod),
    optionalTag('RequestDeliveryDate', item.deliveryDate),
    optionalTag('RequestDeliveryTime', item.deliveryTime),
  ]);
}

function vehicleItemXml(item: MygrantVehicleInquiryItem, defaultItemNo: number): string {
  return requestItemXml(item.requestItemNo || defaultItemNo, [
    tag('RequestVehicleYear', item.vehicleYear),
    tag('RequestVehicleMake', item.vehicleMake),
    tag('RequestVehicleModel', item.vehicleModel),
    tag('RequestQuantity', item.quantity || 1),
    optionalTag('RequestShipFromBranchID', item.shipFromBranchId),
    optionalTag('RequestDeliveryMethod', item.deliveryMethod),
  ]);
}

function requestItemXml(itemNo: number, detailTags: Array<string | undefined>): string {
  return [
    '<RequestItem>',
    tag('RequestItemNo', itemNo),
    '<RequestDetail>',
    ...detailTags.filter(Boolean),
    '</RequestDetail>',
    '</RequestItem>',
  ].join('');
}

function parseResponseItem(block: string): MygrantResponseItem {
  return {
    responseItemNo: parseOptionalInt(extractTag(block, 'ResponseItemNo')),
    productType: extractTag(block, 'ResponseProductType'),
    nagsPrefix: extractTag(block, 'ResponseNAGSPrefix'),
    nagsNumber: extractTag(block, 'ResponseNAGSNumber'),
    nagsColor: extractTag(block, 'ResponseNAGSColor'),
    hardwareIndicator: extractTag(block, 'ResponseNAGSHardwareIndicator'),
    premiumIndicator: extractTag(block, 'ResponseNAGSPremiumIndicator'),
    productId: extractTag(block, 'ResponseProductID'),
    brand: extractTag(block, 'ResponseBrand'),
    qtyAvailable: parseOptionalInt(extractTag(block, 'QtyAvailable')),
    estimatedDeliveryDate: extractTag(block, 'EstimatedDeliveryDate'),
    estimatedDeliveryTime: extractTag(block, 'EstimatedDeliveryTime'),
    truckRun: extractTag(block, 'TruckRun'),
    nextDepartingDate: extractTag(block, 'ResponseNextDepartingDate'),
    nextDepartingTime: extractTag(block, 'ResponseNextDepartingTime'),
    shipFromBranchId: extractTag(block, 'ResponseShipFromBranchID'),
    shipFromBranchName: extractTag(block, 'ResponseShipFromBranchName'),
    drLineNo: extractTag(block, 'DRLineNo'),
    listUnitPrice: parseOptionalFloat(extractTag(block, 'ListUnitPrice')),
    customerUnitPrice: parseOptionalFloat(extractTag(block, 'CustomerUnitPrice')),
    pricingCommitment: extractTag(block, 'PricingCommitment'),
    nextDepartingRoute: extractTag(block, 'ResponseNextDepartingRoute'),
    part: extractTag(block, 'ResponsePart'),
    partDesc: extractTag(block, 'ResponsePartDesc'),
    notes: extractTag(block, 'ResponseNotes'),
    code: extractTag(block, 'ResponseCode'),
    rawXml: block,
  };
}

function extractSoapResult(rawSoap: string): string {
  const result = extractTag(rawSoap, 'InboundTrafficResult') || rawSoap;
  return decodeXmlEntities(stripCdata(result)).trim();
}

function matchBlocks(xml: string, tagName: string): string[] {
  // The inner Mygrant CDATA XML is currently namespace-free. If Mygrant adds
  // namespaces inside the CDATA payload, replace this parser with XMLParser.
  validateInternalTagName(tagName);
  const blocks: string[] = [];
  const openPrefix = `<${tagName}`;
  const closeTag = `</${tagName}>`;
  let cursor = 0;

  while (cursor < xml.length) {
    const start = xml.indexOf(openPrefix, cursor);
    if (start === -1) break;

    const afterName = xml[start + openPrefix.length];
    if (afterName !== '>' && !/\s/.test(afterName || '')) {
      cursor = start + openPrefix.length;
      continue;
    }

    const openEnd = xml.indexOf('>', start);
    if (openEnd === -1) break;

    const end = xml.indexOf(closeTag, openEnd + 1);
    if (end === -1) break;

    blocks.push(xml.slice(start, end + closeTag.length));
    cursor = end + closeTag.length;
  }

  return blocks;
}

function extractBlock(xml: string, tagName: string): string | undefined {
  return matchBlocks(xml, tagName)[0];
}

function extractTag(xml: string, tagName: string): string | undefined {
  validateInternalTagName(tagName);
  let cursor = 0;

  while (cursor < xml.length) {
    const start = xml.indexOf('<', cursor);
    if (start === -1) return undefined;
    if (xml[start + 1] === '/') {
      cursor = start + 2;
      continue;
    }

    const openEnd = xml.indexOf('>', start);
    if (openEnd === -1) return undefined;

    const rawName = xml.slice(start + 1, openEnd).trim().split(/\s/, 1)[0];
    const localName = rawName.includes(':') ? rawName.slice(rawName.indexOf(':') + 1) : rawName;
    if (localName !== tagName) {
      cursor = openEnd + 1;
      continue;
    }

    const closeTag = `</${rawName}>`;
    const closeStart = xml.indexOf(closeTag, openEnd + 1);
    if (closeStart === -1) return undefined;

    const value = xml.slice(openEnd + 1, closeStart);
    return decodeXmlEntities(stripCdata(value)).trim() || undefined;
  }

  return undefined;
}

function validateInternalTagName(tagName: string): void {
  if (!/^[A-Za-z0-9_]+$/.test(tagName)) {
    throw new Error('Invalid internal XML tag name.');
  }
}

function stripCdata(value: string): string {
  return value.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '');
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function tag(name: string, value: string | number): string {
  return `<${name}>${escapeXml(String(value))}</${name}>`;
}

function optionalTag(name: string, value?: string): string | undefined {
  return value ? tag(name, value) : undefined;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function parseOptionalInt(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseOptionalFloat(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Add it to .env.local before running Mygrant integration checks.`);
  return value;
}

function normalizeEnvironment(value?: string): MygrantEnvironment {
  if (value === 'PROD') return 'PROD';
  return 'TEST';
}
