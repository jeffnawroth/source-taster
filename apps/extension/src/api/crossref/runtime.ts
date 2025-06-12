/* tslint:disable */
/* eslint-disable */
/**
 * Crossref REST API
 * Jump to a section: - <a href=\"#introduction\">Introduction</a> - <a href=\"#contents\">Contents of the API</a>     - <a href=\"#data\">Data sources</a>     - <a href=\"#request-types\">Request types</a>     - <a href=\"#result-types\">Response types</a>     - <a href=\"#content-negotiation\">Content negotiation</a> - <a href=\"#uses\">How to use the API</a>     - <a href=\"#best-practice\">Best practice</a>     - <a href=\"#access\">Access and pools</a>     - <a href=\"#limits\">Request limits</a>     - <a href=\"#cursors\">Large response sets</a> - <a href=\"#libraries\">Code libraries</a> - <a href=\"#status\">Current status and errors</a> - <a href=\"#try-it-out\">Try it out</a>   ## Introduction<a name=\'introduction\'></a>  Welcome to the Crossref REST API documentation. This is one of several ways to access our metadata. See [our website documentation](https://www.crossref.org/documentation/retrieve-metadata/) for other options.   To get started quickly, see the <a href=\"#try-it-out\">try it out</a> sections below. To learn more about how to use our APIs, visit the [learning hub](https://www.crossref.org/learning/), or see  [tips for using our APIs](https://www.crossref.org/documentation/retrieve-metadata/rest-api/tips-for-using-the-crossref-rest-api/).   ## Contents of the API<a name=\'contents\'></a>  ### Data sources<a name=\'data\'></a>  The REST API returns metadata records about scholarly objects, including publications, grants, and journals. The metadata has several sources:  1. **Crossref members**: We are a community of organisations that operate in scholarly research and scholarly communications. Members deposit metadata, including registering a DOI for each item and its resolution URL. Alongside the DOI, they deposit information such as the title, authors, and references.  1. **Matching processes**: We seek to identify links between deposited metadata and existing metadata records. When a match is found, an identifier is added to the linked records. For example, if a reference is deposited without a DOI and we attempt to match its metadata to a Crossref record.  1. **Trusted third party sources**: We work with selected third party sources, such as Retraction Watch, to add additional metadata to records.   We don’t scrape websites or pull data from other aggregators to fill in gaps in the metadata. Not all Crossref members provide all metadata elements, so the amount of information in records varies.  We also don’t collect or provide full-text of records, however you can find the landing page of each record in the works endpoint via links in the `resolution` field.  Metadata typically appears in the REST API within 20 minutes of deposit by a member. Summarising information (such as citation counts) are calculated once per day.  Almost all of the metadata we hold is reusable without restriction, with the exception of abstracts, which are subject to publisher or author copyright. See the [REST API license information](https://www.crossref.org/documentation/retrieve-metadata/rest-api/rest-api-metadata-license-information/) for a more detailed discussion. We also have a [privacy policy](https://www.crossref.org/operations-and-sustainability/privacy/).  Some metadata records have been aliased, meaning that the DOI will always resolve to a different one (the prime DOI). In this case, querying for an aliased record will be redirected to the prime record. Aliased DOIs are also excluded from lists. If a DOI has aliases, these are given in the `alias` field.  Crossref is not the only DOI registration agency, a full list of [registration agencies](https://www.doi.org/the-community/existing-registration-agencies/) can be found on the DOI foundation website. DOIs from other agencies are not included in our REST API and will return a 404 status. You can determine the registration agency for a DOI or its prefix using the DOI foundation API, e.g. https://doi.org/ra/10.3390.  ### Endpoints  The REST API provides a number of endpoints. For details of the metadata and options available in each endpoint, see <a href=\"#try-it-out\">below</a>. The following are currently provided:  - Works: scholarly works that have a DOI registered with Crossref. - Prefixes: details about DOI prefixes, including works registered using each prefix. - Members: past and present organisations that have registered works. - Funders: funder registry DOIs. - Journals: summary statistics of items registered in journals and other serials. - Licenses: counts of works registered with specific licenses. - Types: works registered of a specific type (for example `book`, or `journal-article`)  ### Request types<a name=\"request-types\"></a>  Full details of parameters for each endpoint are given <a href=\"#try-it-out\">below</a>. The primary ways the Crossref REST API is used are as follows:  **Get a list of all items**. Returns the first page of items in the endpoint, e.g. https://api.crossref.org/works  **Return an individual record** specified by its identifier, e.g. https://api.crossref.org/works/10.5555%2F12345678  **Get a filtered list of items** (available on some endpoints). Returns records where specified fields have a certain value or property, e.g. https://api.crossref.org/v1/funders?filter=location:Switzerland  **Make basic metadata queries** (available on some endpoints). Return records where one or more fields has a given query term or terms inside it. Note that the results are not sorted by relevance. See e.g. https://api.crossref.org/v1/members?query=association+library  **Get summary statistics** using a facet parameter (`works` endpoint only). Returns a list of field values and how many records have that value. Use `:*` to get a maximum of 1000 values or specify an integer (such as `:10`) to get the most popular values e.g. https://api.crossref.org/v1/works?filter=from-pub-date:2020-01-10,until-pub-date:2020-01-10&facet=type-name:10. The counts returned by facets (and in the `total-results` field) are approximations and may differ a small amount from the exact record count, however they are reliable enough for most purposes.  ### Response types<a name=\'result-types\'></a>  All responses are in JSON format. The mime-type for API results is `application/vnd.crossref-api-message+json`. If you access the API via a browser, we recommend using a JSON formatter plugin.  There are three types of responses:  **Singleton**: the metadata record of a single object. Retrieving metadata for a specific identifier (e.g. DOI, ISSN, funder identifier) returns a singleton. For example:   https://api.crossref.org/works/10.5555%2F12345678  **Headers only**: you can use HTTP HEAD requests to quickly determine existence of a singleton, which is very fast because it does not return any metadata. It only returns headers and an HTTP status code (200=exists, 404=does not exist). For example (in a terminal):  `curl --head \"https://api.crossref.org/members/98\"`  **List**: responses can contain multiple entries. Requests with queries or filters returns a list. You can specify the maximum number of items returned in the list using the `rows` parameter, which can be set to 0 to retrieve only summary information. For example:  https://api.crossref.org/funders?rows=5  ### Content negotiation<a name=\'content-negotiation\'></a>  Content negotiation allows requests for single records to specify the format of the response. The format is included in the `Accept` field of the request header. `style` and `locale` headers are also available for some formats.  Read more about content negotiation, including a list of available formats <a href=\'https://www.crossref.org/documentation/retrieve-metadata/content-negotiation/\'>in our user documentation</a>.  ## How to use the API<a name=\'uses\'></a>   ### Best practice<a name=\'best-practice\'></a>  By using our REST API, you are part of our community that supports open access to scholarly metadata. We ask that you are considerate of other users and don\'t take actions that will make the API unstable, and hence unusable for others. You can do this by:   - Caching responses so you don\'t make the same requests over and over. Be considerate about the frequency with which you refresh your cache.   - Use the `mailto` parameter and specify a `User-Agent` header that identifies you and your script.  - Handle HTML response codes and monitor response times. Back off if the response times start to increase.  ### Access and pools<a name=\'access\'></a>  The data we provide is public and available anonymously without authentication. This is part of our mission and we are committed to providing the data in this way, however there are advantages to identifying yourself.   Requests are served by one of three different pools, depending on the level of identification and authentication:   - **Public:** no authentication or user identification.  - **Polite:** provide an email address in the `mailto` parameter of your request. This means that we can contact you in case there is an issue rather than blocking you directly.  - **Plus subscriber:** For users who integrate our API into a production tool, we offer [a premium service](https://www.crossref.org/documentation/metadata-plus/) with higher rate limits, better levels of support, and access to monthly snapshots. Plus subscribers identify themselves via an API key in the request header.  ### Request limits<a name=\'limits\'></a>  In order to make the data accessible to all and keep the service stable, we operate limits that apply to individual users.   **Rate limits**: These are included in the results headers under `x-rate-limit-limit` and `x-rate-limit-interval` and depend on the pool accessed by your request. This gives the maximum number of requests you can make in a given time period. The public and polite pools have a rate limit of 50 requests per second, and the Plus pool has a limit of 150 requests per second.  **Concurrent request limits**: Users of the public and polite pools are limited to 5 concurrent requests.  If you exceed the rate limits, you will receive a 429 response status. In this case, wait a short while and try your request again at a lower rate and/or with lower concurrency.   Rate limits are usually applied and removed automatically. In the rare case that we apply a block manually, we will make an effort to contact you to resolve the issue. For this reason we strongly recommend providing a `mailto` parameter in all requests.   ### Large response sets<a name=\'cursors\'></a>  Each endpoint has a limit on the number of items returned in a single request. Paginating through multiple pages of results is possible through the `cursor` parameter.   To retrieve multiple pages, add `cursor=*` to your first request (and `rows` > 0). The response will include a `next-cursor` value. Use this in your next request to obtain the following page of results. Stop sending requests when the number of items in the response is less than the number of `rows` requested.  Cursors expire after 5 minutes if not used.  ## Code libraries<a name=\'libraries\'></a>  There are a number of libraries that have been written for the Crossref REST API. These are neither maintained nor endorsed by Crossref (except where noted). Available libraries include:  - [crossrefapi](https://github.com/caltechlibrary/crossrefapi) (Go) - [pitaya](https://github.com/naustica/Pitaya) (Julia) - [crossref-commons](https://gitlab.com/crossref/crossref_commons_py) (Python, developed by Crossref) - [habanero](https://github.com/sckott/habanero) (Python) - [crossrefapi](https://github.com/fabiobatalha/crossrefapi) (Python) - [rcrossref](https://github.com/ropensci/rcrossref) (R) - [serrano](https://github.com/sckott/serrano) (Ruby) - [crossref-rs](https://github.com/MattsSe/crossref-rs) (rust) - [Crossref API Typescript client](https://www.npmjs.com/package/@jamesgopsill/crossref-client) (Typescript)  ## Current status and errors<a name=\'status\'></a>  We record and report service issues on our [status page](http://status.crossref.org). If you see an issue that is not noted, please contact us via our [community forum](https://community.crossref.org/) or directly through our [support team](https://www.crossref.org/contact/).  We also post notices of any ongoing performance issues with our services on our social media feeds.  The HTML status returned by successful queries is 200 and we use standard HTML codes to indicate errors (4XX for errors in the request and 5XX for server-side errors). Some records redirect and will return a 301 response, see [Changing or deleting DOIs](https://www.crossref.org/documentation/register-maintain-records/creating-and-managing-dois/changing-or-deleting-dois/).  ## Try it out<a name=\'try-it-out\'></a> 
 *
 * The version of the OpenAPI document: 3.40.4
 * Contact: support@crossref.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


export const BASE_PATH = "http://localhost".replace(/\/+$/, "");

export interface ConfigurationParameters {
    basePath?: string; // override base path
    fetchApi?: FetchAPI; // override for fetch implementation
    middleware?: Middleware[]; // middleware to apply before/after fetch requests
    queryParamsStringify?: (params: HTTPQuery) => string; // stringify function for query strings
    username?: string; // parameter for basic security
    password?: string; // parameter for basic security
    apiKey?: string | Promise<string> | ((name: string) => string | Promise<string>); // parameter for apiKey security
    accessToken?: string | Promise<string> | ((name?: string, scopes?: string[]) => string | Promise<string>); // parameter for oauth2 security
    headers?: HTTPHeaders; //header params we want to use on every request
    credentials?: RequestCredentials; //value for the credentials param we want to use on each request
}

export class Configuration {
    constructor(private configuration: ConfigurationParameters = {}) {}

    set config(configuration: Configuration) {
        this.configuration = configuration;
    }

    get basePath(): string {
        return this.configuration.basePath != null ? this.configuration.basePath : BASE_PATH;
    }

    get fetchApi(): FetchAPI | undefined {
        return this.configuration.fetchApi;
    }

    get middleware(): Middleware[] {
        return this.configuration.middleware || [];
    }

    get queryParamsStringify(): (params: HTTPQuery) => string {
        return this.configuration.queryParamsStringify || querystring;
    }

    get username(): string | undefined {
        return this.configuration.username;
    }

    get password(): string | undefined {
        return this.configuration.password;
    }

    get apiKey(): ((name: string) => string | Promise<string>) | undefined {
        const apiKey = this.configuration.apiKey;
        if (apiKey) {
            return typeof apiKey === 'function' ? apiKey : () => apiKey;
        }
        return undefined;
    }

    get accessToken(): ((name?: string, scopes?: string[]) => string | Promise<string>) | undefined {
        const accessToken = this.configuration.accessToken;
        if (accessToken) {
            return typeof accessToken === 'function' ? accessToken : async () => accessToken;
        }
        return undefined;
    }

    get headers(): HTTPHeaders | undefined {
        return this.configuration.headers;
    }

    get credentials(): RequestCredentials | undefined {
        return this.configuration.credentials;
    }
}

export const DefaultConfig = new Configuration();

/**
 * This is the base class for all generated API classes.
 */
export class BaseAPI {

    private static readonly jsonRegex = new RegExp('^(:?application\/json|[^;/ \t]+\/[^;/ \t]+[+]json)[ \t]*(:?;.*)?$', 'i');
    private middleware: Middleware[];

    constructor(protected configuration = DefaultConfig) {
        this.middleware = configuration.middleware;
    }

    withMiddleware<T extends BaseAPI>(this: T, ...middlewares: Middleware[]) {
        const next = this.clone<T>();
        next.middleware = next.middleware.concat(...middlewares);
        return next;
    }

    withPreMiddleware<T extends BaseAPI>(this: T, ...preMiddlewares: Array<Middleware['pre']>) {
        const middlewares = preMiddlewares.map((pre) => ({ pre }));
        return this.withMiddleware<T>(...middlewares);
    }

    withPostMiddleware<T extends BaseAPI>(this: T, ...postMiddlewares: Array<Middleware['post']>) {
        const middlewares = postMiddlewares.map((post) => ({ post }));
        return this.withMiddleware<T>(...middlewares);
    }

    /**
     * Check if the given MIME is a JSON MIME.
     * JSON MIME examples:
     *   application/json
     *   application/json; charset=UTF8
     *   APPLICATION/JSON
     *   application/vnd.company+json
     * @param mime - MIME (Multipurpose Internet Mail Extensions)
     * @return True if the given MIME is JSON, false otherwise.
     */
    protected isJsonMime(mime: string | null | undefined): boolean {
        if (!mime) {
            return false;
        }
        return BaseAPI.jsonRegex.test(mime);
    }

    protected async request(context: RequestOpts, initOverrides?: RequestInit | InitOverrideFunction): Promise<Response> {
        const { url, init } = await this.createFetchParams(context, initOverrides);
        const response = await this.fetchApi(url, init);
        if (response && (response.status >= 200 && response.status < 300)) {
            return response;
        }
        throw new ResponseError(response, 'Response returned an error code');
    }

    private async createFetchParams(context: RequestOpts, initOverrides?: RequestInit | InitOverrideFunction) {
        let url = this.configuration.basePath + context.path;
        if (context.query !== undefined && Object.keys(context.query).length !== 0) {
            // only add the querystring to the URL if there are query parameters.
            // this is done to avoid urls ending with a "?" character which buggy webservers
            // do not handle correctly sometimes.
            url += '?' + this.configuration.queryParamsStringify(context.query);
        }

        const headers = Object.assign({}, this.configuration.headers, context.headers);
        Object.keys(headers).forEach(key => headers[key] === undefined ? delete headers[key] : {});

        const initOverrideFn =
            typeof initOverrides === "function"
                ? initOverrides
                : async () => initOverrides;

        const initParams = {
            method: context.method,
            headers,
            body: context.body,
            credentials: this.configuration.credentials,
        };

        const overriddenInit: RequestInit = {
            ...initParams,
            ...(await initOverrideFn({
                init: initParams,
                context,
            }))
        };

        let body: any;
        if (isFormData(overriddenInit.body)
            || (overriddenInit.body instanceof URLSearchParams)
            || isBlob(overriddenInit.body)) {
          body = overriddenInit.body;
        } else if (this.isJsonMime(headers['Content-Type'])) {
          body = JSON.stringify(overriddenInit.body);
        } else {
          body = overriddenInit.body;
        }

        const init: RequestInit = {
            ...overriddenInit,
            body
        };

        return { url, init };
    }

    private fetchApi = async (url: string, init: RequestInit) => {
        let fetchParams = { url, init };
        for (const middleware of this.middleware) {
            if (middleware.pre) {
                fetchParams = await middleware.pre({
                    fetch: this.fetchApi,
                    ...fetchParams,
                }) || fetchParams;
            }
        }
        let response: Response | undefined = undefined;
        try {
            response = await (this.configuration.fetchApi || fetch)(fetchParams.url, fetchParams.init);
        } catch (e) {
            for (const middleware of this.middleware) {
                if (middleware.onError) {
                    response = await middleware.onError({
                        fetch: this.fetchApi,
                        url: fetchParams.url,
                        init: fetchParams.init,
                        error: e,
                        response: response ? response.clone() : undefined,
                    }) || response;
                }
            }
            if (response === undefined) {
              if (e instanceof Error) {
                throw new FetchError(e, 'The request failed and the interceptors did not return an alternative response');
              } else {
                throw e;
              }
            }
        }
        for (const middleware of this.middleware) {
            if (middleware.post) {
                response = await middleware.post({
                    fetch: this.fetchApi,
                    url: fetchParams.url,
                    init: fetchParams.init,
                    response: response.clone(),
                }) || response;
            }
        }
        return response;
    }

    /**
     * Create a shallow clone of `this` by constructing a new instance
     * and then shallow cloning data members.
     */
    private clone<T extends BaseAPI>(this: T): T {
        const constructor = this.constructor as any;
        const next = new constructor(this.configuration);
        next.middleware = this.middleware.slice();
        return next;
    }
};

function isBlob(value: any): value is Blob {
    return typeof Blob !== 'undefined' && value instanceof Blob;
}

function isFormData(value: any): value is FormData {
    return typeof FormData !== "undefined" && value instanceof FormData;
}

export class ResponseError extends Error {
    override name: "ResponseError" = "ResponseError";
    constructor(public response: Response, msg?: string) {
        super(msg);
    }
}

export class FetchError extends Error {
    override name: "FetchError" = "FetchError";
    constructor(public cause: Error, msg?: string) {
        super(msg);
    }
}

export class RequiredError extends Error {
    override name: "RequiredError" = "RequiredError";
    constructor(public field: string, msg?: string) {
        super(msg);
    }
}

export const COLLECTION_FORMATS = {
    csv: ",",
    ssv: " ",
    tsv: "\t",
    pipes: "|",
};

export type FetchAPI = WindowOrWorkerGlobalScope['fetch'];

export type Json = any;
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
export type HTTPHeaders = { [key: string]: string };
export type HTTPQuery = { [key: string]: string | number | null | boolean | Array<string | number | null | boolean> | Set<string | number | null | boolean> | HTTPQuery };
export type HTTPBody = Json | FormData | URLSearchParams;
export type HTTPRequestInit = { headers?: HTTPHeaders; method: HTTPMethod; credentials?: RequestCredentials; body?: HTTPBody };
export type ModelPropertyNaming = 'camelCase' | 'snake_case' | 'PascalCase' | 'original';

export type InitOverrideFunction = (requestContext: { init: HTTPRequestInit, context: RequestOpts }) => Promise<RequestInit>

export interface FetchParams {
    url: string;
    init: RequestInit;
}

export interface RequestOpts {
    path: string;
    method: HTTPMethod;
    headers: HTTPHeaders;
    query?: HTTPQuery;
    body?: HTTPBody;
}

export function querystring(params: HTTPQuery, prefix: string = ''): string {
    return Object.keys(params)
        .map(key => querystringSingleKey(key, params[key], prefix))
        .filter(part => part.length > 0)
        .join('&');
}

function querystringSingleKey(key: string, value: string | number | null | undefined | boolean | Array<string | number | null | boolean> | Set<string | number | null | boolean> | HTTPQuery, keyPrefix: string = ''): string {
    const fullKey = keyPrefix + (keyPrefix.length ? `[${key}]` : key);
    if (value instanceof Array) {
        const multiValue = value.map(singleValue => encodeURIComponent(String(singleValue)))
            .join(`&${encodeURIComponent(fullKey)}=`);
        return `${encodeURIComponent(fullKey)}=${multiValue}`;
    }
    if (value instanceof Set) {
        const valueAsArray = Array.from(value);
        return querystringSingleKey(key, valueAsArray, keyPrefix);
    }
    if (value instanceof Date) {
        return `${encodeURIComponent(fullKey)}=${encodeURIComponent(value.toISOString())}`;
    }
    if (value instanceof Object) {
        return querystring(value as HTTPQuery, fullKey);
    }
    return `${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`;
}

export function exists(json: any, key: string) {
    const value = json[key];
    return value !== null && value !== undefined;
}

export function mapValues(data: any, fn: (item: any) => any) {
  return Object.keys(data).reduce(
    (acc, key) => ({ ...acc, [key]: fn(data[key]) }),
    {}
  );
}

export function canConsumeForm(consumes: Consume[]): boolean {
    for (const consume of consumes) {
        if ('multipart/form-data' === consume.contentType) {
            return true;
        }
    }
    return false;
}

export interface Consume {
    contentType: string;
}

export interface RequestContext {
    fetch: FetchAPI;
    url: string;
    init: RequestInit;
}

export interface ResponseContext {
    fetch: FetchAPI;
    url: string;
    init: RequestInit;
    response: Response;
}

export interface ErrorContext {
    fetch: FetchAPI;
    url: string;
    init: RequestInit;
    error: unknown;
    response?: Response;
}

export interface Middleware {
    pre?(context: RequestContext): Promise<FetchParams | void>;
    post?(context: ResponseContext): Promise<Response | void>;
    onError?(context: ErrorContext): Promise<Response | void>;
}

export interface ApiResponse<T> {
    raw: Response;
    value(): Promise<T>;
}

export interface ResponseTransformer<T> {
    (json: any): T;
}

export class JSONApiResponse<T> {
    constructor(public raw: Response, private transformer: ResponseTransformer<T> = (jsonValue: any) => jsonValue) {}

    async value(): Promise<T> {
        return this.transformer(await this.raw.json());
    }
}

export class VoidApiResponse {
    constructor(public raw: Response) {}

    async value(): Promise<void> {
        return undefined;
    }
}

export class BlobApiResponse {
    constructor(public raw: Response) {}

    async value(): Promise<Blob> {
        return await this.raw.blob();
    };
}

export class TextApiResponse {
    constructor(public raw: Response) {}

    async value(): Promise<string> {
        return await this.raw.text();
    };
}
