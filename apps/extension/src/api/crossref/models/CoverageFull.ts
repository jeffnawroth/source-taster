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

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface CoverageFull
 */
export interface CoverageFull {
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    affiliationsCurrent: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    similarityCheckingCurrent: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    descriptionsCurrent: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    rorIdsCurrent: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    referencesBackfie: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    fundersBackfile: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    licensesBackfile: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    fundersCurrent: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    affiliationsBackfile: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    resourceLinksBackfile: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    orcidsBackfile: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    updatePoliciesCurrent: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    rorIdsBackfile: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    orcidsCurrent: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    similarityCheckingBackfile: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    descriptionsBackfile: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    awardNumbersBackfile: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    updatePoliciesBackfile: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    licensesCurrent: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    awardNumbersCurrent: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    abstractsBackfile: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    resourceLinksCurrent: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    abstractsCurrent: number;
    /**
     * 
     * @type {number}
     * @memberof CoverageFull
     */
    referencesCurrent: number;
}

/**
 * Check if a given object implements the CoverageFull interface.
 */
export function instanceOfCoverageFull(value: object): value is CoverageFull {
    if (!('affiliationsCurrent' in value) || value['affiliationsCurrent'] === undefined) return false;
    if (!('similarityCheckingCurrent' in value) || value['similarityCheckingCurrent'] === undefined) return false;
    if (!('descriptionsCurrent' in value) || value['descriptionsCurrent'] === undefined) return false;
    if (!('rorIdsCurrent' in value) || value['rorIdsCurrent'] === undefined) return false;
    if (!('referencesBackfie' in value) || value['referencesBackfie'] === undefined) return false;
    if (!('fundersBackfile' in value) || value['fundersBackfile'] === undefined) return false;
    if (!('licensesBackfile' in value) || value['licensesBackfile'] === undefined) return false;
    if (!('fundersCurrent' in value) || value['fundersCurrent'] === undefined) return false;
    if (!('affiliationsBackfile' in value) || value['affiliationsBackfile'] === undefined) return false;
    if (!('resourceLinksBackfile' in value) || value['resourceLinksBackfile'] === undefined) return false;
    if (!('orcidsBackfile' in value) || value['orcidsBackfile'] === undefined) return false;
    if (!('updatePoliciesCurrent' in value) || value['updatePoliciesCurrent'] === undefined) return false;
    if (!('rorIdsBackfile' in value) || value['rorIdsBackfile'] === undefined) return false;
    if (!('orcidsCurrent' in value) || value['orcidsCurrent'] === undefined) return false;
    if (!('similarityCheckingBackfile' in value) || value['similarityCheckingBackfile'] === undefined) return false;
    if (!('descriptionsBackfile' in value) || value['descriptionsBackfile'] === undefined) return false;
    if (!('awardNumbersBackfile' in value) || value['awardNumbersBackfile'] === undefined) return false;
    if (!('updatePoliciesBackfile' in value) || value['updatePoliciesBackfile'] === undefined) return false;
    if (!('licensesCurrent' in value) || value['licensesCurrent'] === undefined) return false;
    if (!('awardNumbersCurrent' in value) || value['awardNumbersCurrent'] === undefined) return false;
    if (!('abstractsBackfile' in value) || value['abstractsBackfile'] === undefined) return false;
    if (!('resourceLinksCurrent' in value) || value['resourceLinksCurrent'] === undefined) return false;
    if (!('abstractsCurrent' in value) || value['abstractsCurrent'] === undefined) return false;
    if (!('referencesCurrent' in value) || value['referencesCurrent'] === undefined) return false;
    return true;
}

export function CoverageFullFromJSON(json: any): CoverageFull {
    return CoverageFullFromJSONTyped(json, false);
}

export function CoverageFullFromJSONTyped(json: any, ignoreDiscriminator: boolean): CoverageFull {
    if (json == null) {
        return json;
    }
    return {
        
        'affiliationsCurrent': json['affiliations-current'],
        'similarityCheckingCurrent': json['similarity-checking-current'],
        'descriptionsCurrent': json['descriptions-current'],
        'rorIdsCurrent': json['ror-ids-current'],
        'referencesBackfie': json['references-backfie'],
        'fundersBackfile': json['funders-backfile'],
        'licensesBackfile': json['licenses-backfile'],
        'fundersCurrent': json['funders-current'],
        'affiliationsBackfile': json['affiliations-backfile'],
        'resourceLinksBackfile': json['resource-links-backfile'],
        'orcidsBackfile': json['orcids-backfile'],
        'updatePoliciesCurrent': json['update-policies-current'],
        'rorIdsBackfile': json['ror-ids-backfile'],
        'orcidsCurrent': json['orcids-current'],
        'similarityCheckingBackfile': json['similarity-checking-backfile'],
        'descriptionsBackfile': json['descriptions-backfile'],
        'awardNumbersBackfile': json['award-numbers-backfile'],
        'updatePoliciesBackfile': json['update-policies-backfile'],
        'licensesCurrent': json['licenses-current'],
        'awardNumbersCurrent': json['award-numbers-current'],
        'abstractsBackfile': json['abstracts-backfile'],
        'resourceLinksCurrent': json['resource-links-current'],
        'abstractsCurrent': json['abstracts-current'],
        'referencesCurrent': json['references-current'],
    };
}

export function CoverageFullToJSON(json: any): CoverageFull {
    return CoverageFullToJSONTyped(json, false);
}

export function CoverageFullToJSONTyped(value?: CoverageFull | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'affiliations-current': value['affiliationsCurrent'],
        'similarity-checking-current': value['similarityCheckingCurrent'],
        'descriptions-current': value['descriptionsCurrent'],
        'ror-ids-current': value['rorIdsCurrent'],
        'references-backfie': value['referencesBackfie'],
        'funders-backfile': value['fundersBackfile'],
        'licenses-backfile': value['licensesBackfile'],
        'funders-current': value['fundersCurrent'],
        'affiliations-backfile': value['affiliationsBackfile'],
        'resource-links-backfile': value['resourceLinksBackfile'],
        'orcids-backfile': value['orcidsBackfile'],
        'update-policies-current': value['updatePoliciesCurrent'],
        'ror-ids-backfile': value['rorIdsBackfile'],
        'orcids-current': value['orcidsCurrent'],
        'similarity-checking-backfile': value['similarityCheckingBackfile'],
        'descriptions-backfile': value['descriptionsBackfile'],
        'award-numbers-backfile': value['awardNumbersBackfile'],
        'update-policies-backfile': value['updatePoliciesBackfile'],
        'licenses-current': value['licensesCurrent'],
        'award-numbers-current': value['awardNumbersCurrent'],
        'abstracts-backfile': value['abstractsBackfile'],
        'resource-links-current': value['resourceLinksCurrent'],
        'abstracts-current': value['abstractsCurrent'],
        'references-current': value['referencesCurrent'],
    };
}

