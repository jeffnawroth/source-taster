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
import type { WorkInstitution } from './WorkInstitution';
import {
    WorkInstitutionFromJSON,
    WorkInstitutionFromJSONTyped,
    WorkInstitutionToJSON,
    WorkInstitutionToJSONTyped,
} from './WorkInstitution';
import type { WorkLicense } from './WorkLicense';
import {
    WorkLicenseFromJSON,
    WorkLicenseFromJSONTyped,
    WorkLicenseToJSON,
    WorkLicenseToJSONTyped,
} from './WorkLicense';
import type { WorkLink } from './WorkLink';
import {
    WorkLinkFromJSON,
    WorkLinkFromJSONTyped,
    WorkLinkToJSON,
    WorkLinkToJSONTyped,
} from './WorkLink';
import type { ModelDate } from './ModelDate';
import {
    ModelDateFromJSON,
    ModelDateFromJSONTyped,
    ModelDateToJSON,
    ModelDateToJSONTyped,
} from './ModelDate';
import type { WorkRelationObject } from './WorkRelationObject';
import {
    WorkRelationObjectFromJSON,
    WorkRelationObjectFromJSONTyped,
    WorkRelationObjectToJSON,
    WorkRelationObjectToJSONTyped,
} from './WorkRelationObject';
import type { Reference } from './Reference';
import {
    ReferenceFromJSON,
    ReferenceFromJSONTyped,
    ReferenceToJSON,
    ReferenceToJSONTyped,
} from './Reference';
import type { WorkDomain } from './WorkDomain';
import {
    WorkDomainFromJSON,
    WorkDomainFromJSONTyped,
    WorkDomainToJSON,
    WorkDomainToJSONTyped,
} from './WorkDomain';
import type { WorkClinicalTrial } from './WorkClinicalTrial';
import {
    WorkClinicalTrialFromJSON,
    WorkClinicalTrialFromJSONTyped,
    WorkClinicalTrialToJSON,
    WorkClinicalTrialToJSONTyped,
} from './WorkClinicalTrial';
import type { VersionInfo } from './VersionInfo';
import {
    VersionInfoFromJSON,
    VersionInfoFromJSONTyped,
    VersionInfoToJSON,
    VersionInfoToJSONTyped,
} from './VersionInfo';
import type { DateParts } from './DateParts';
import {
    DatePartsFromJSON,
    DatePartsFromJSONTyped,
    DatePartsToJSON,
    DatePartsToJSONTyped,
} from './DateParts';
import type { PostedContentStatus } from './PostedContentStatus';
import {
    PostedContentStatusFromJSON,
    PostedContentStatusFromJSONTyped,
    PostedContentStatusToJSON,
    PostedContentStatusToJSONTyped,
} from './PostedContentStatus';
import type { WorkAssertion } from './WorkAssertion';
import {
    WorkAssertionFromJSON,
    WorkAssertionFromJSONTyped,
    WorkAssertionToJSON,
    WorkAssertionToJSONTyped,
} from './WorkAssertion';
import type { DateAndVersion } from './DateAndVersion';
import {
    DateAndVersionFromJSON,
    DateAndVersionFromJSONTyped,
    DateAndVersionToJSON,
    DateAndVersionToJSONTyped,
} from './DateAndVersion';
import type { WorkISSNType } from './WorkISSNType';
import {
    WorkISSNTypeFromJSON,
    WorkISSNTypeFromJSONTyped,
    WorkISSNTypeToJSON,
    WorkISSNTypeToJSONTyped,
} from './WorkISSNType';
import type { WorkFreeToRead } from './WorkFreeToRead';
import {
    WorkFreeToReadFromJSON,
    WorkFreeToReadFromJSONTyped,
    WorkFreeToReadToJSON,
    WorkFreeToReadToJSONTyped,
} from './WorkFreeToRead';
import type { WorkProject } from './WorkProject';
import {
    WorkProjectFromJSON,
    WorkProjectFromJSONTyped,
    WorkProjectToJSON,
    WorkProjectToJSONTyped,
} from './WorkProject';
import type { WorkStandardsBody } from './WorkStandardsBody';
import {
    WorkStandardsBodyFromJSON,
    WorkStandardsBodyFromJSONTyped,
    WorkStandardsBodyToJSON,
    WorkStandardsBodyToJSONTyped,
} from './WorkStandardsBody';
import type { Author } from './Author';
import {
    AuthorFromJSON,
    AuthorFromJSONTyped,
    AuthorToJSON,
    AuthorToJSONTyped,
} from './Author';
import type { WorkFunder } from './WorkFunder';
import {
    WorkFunderFromJSON,
    WorkFunderFromJSONTyped,
    WorkFunderToJSON,
    WorkFunderToJSONTyped,
} from './WorkFunder';
import type { Resources } from './Resources';
import {
    ResourcesFromJSON,
    ResourcesFromJSONTyped,
    ResourcesToJSON,
    ResourcesToJSONTyped,
} from './Resources';
import type { WorkJournalIssue } from './WorkJournalIssue';
import {
    WorkJournalIssueFromJSON,
    WorkJournalIssueFromJSONTyped,
    WorkJournalIssueToJSON,
    WorkJournalIssueToJSONTyped,
} from './WorkJournalIssue';
import type { WorkUpdate } from './WorkUpdate';
import {
    WorkUpdateFromJSON,
    WorkUpdateFromJSONTyped,
    WorkUpdateToJSON,
    WorkUpdateToJSONTyped,
} from './WorkUpdate';
import type { WorkReview } from './WorkReview';
import {
    WorkReviewFromJSON,
    WorkReviewFromJSONTyped,
    WorkReviewToJSON,
    WorkReviewToJSONTyped,
} from './WorkReview';

/**
 * 
 * @export
 * @interface Work
 */
export interface Work {
    /**
     * 
     * @type {Array<WorkInstitution>}
     * @memberof Work
     */
    institution?: Array<WorkInstitution>;
    /**
     * 
     * @type {DateAndVersion}
     * @memberof Work
     */
    indexed: DateAndVersion;
    /**
     * 
     * @type {DateParts}
     * @memberof Work
     */
    posted?: DateParts;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    publisherLocation?: string;
    /**
     * 
     * @type {Array<WorkUpdate>}
     * @memberof Work
     */
    updateTo?: Array<WorkUpdate>;
    /**
     * 
     * @type {Array<WorkStandardsBody>}
     * @memberof Work
     */
    standardsBody?: Array<WorkStandardsBody>;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    editionNumber?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof Work
     */
    groupTitle?: Array<string>;
    /**
     * 
     * @type {number}
     * @memberof Work
     */
    referenceCount?: number;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    publisher: string;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    issue?: string;
    /**
     * 
     * @type {Array<WorkISSNType>}
     * @memberof Work
     */
    isbnType?: Array<WorkISSNType>;
    /**
     * 
     * @type {Array<WorkLicense>}
     * @memberof Work
     */
    license?: Array<WorkLicense>;
    /**
     * 
     * @type {Array<WorkFunder>}
     * @memberof Work
     */
    funder?: Array<WorkFunder>;
    /**
     * 
     * @type {WorkDomain}
     * @memberof Work
     */
    contentDomain?: WorkDomain;
    /**
     * 
     * @type {Array<Author>}
     * @memberof Work
     */
    chair?: Array<Author>;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    shortContainerTitle?: string;
    /**
     * 
     * @type {DateParts}
     * @memberof Work
     */
    accepted?: DateParts;
    /**
     * 
     * @type {DateParts}
     * @memberof Work
     */
    contentUpdated?: DateParts;
    /**
     * 
     * @type {DateParts}
     * @memberof Work
     */
    publishedPrint?: DateParts;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    _abstract?: string;
    /**
     * The DOI identifier associated with the work
     * @type {string}
     * @memberof Work
     */
    dOI: string;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    type: string;
    /**
     * 
     * @type {ModelDate}
     * @memberof Work
     */
    created: ModelDate;
    /**
     * 
     * @type {DateParts}
     * @memberof Work
     */
    approved?: DateParts;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    page?: string;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    updatePolicy?: string;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    source: string;
    /**
     * 
     * @type {number}
     * @memberof Work
     */
    isReferencedByCount?: number;
    /**
     * 
     * @type {Array<string>}
     * @memberof Work
     */
    title?: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    prefix: string;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    volume?: string;
    /**
     * 
     * @type {Array<WorkClinicalTrial>}
     * @memberof Work
     */
    clinicalTrialNumber?: Array<WorkClinicalTrial>;
    /**
     * 
     * @type {Array<Author>}
     * @memberof Work
     */
    author?: Array<Author>;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    member: string;
    /**
     * 
     * @type {DateParts}
     * @memberof Work
     */
    contentCreated?: DateParts;
    /**
     * 
     * @type {DateParts}
     * @memberof Work
     */
    publishedOnline?: DateParts;
    /**
     * 
     * @type {Array<Reference>}
     * @memberof Work
     */
    reference?: Array<Reference>;
    /**
     * 
     * @type {Array<WorkUpdate>}
     * @memberof Work
     */
    updatedBy?: Array<WorkUpdate>;
    /**
     * 
     * @type {Array<string>}
     * @memberof Work
     */
    containerTitle?: Array<string>;
    /**
     * 
     * @type {WorkReview}
     * @memberof Work
     */
    review?: WorkReview;
    /**
     * 
     * @type {WorkProject}
     * @memberof Work
     */
    project?: WorkProject;
    /**
     * 
     * @type {Array<string>}
     * @memberof Work
     */
    originalTitle?: Array<string>;
    /**
     * 
     * @type {PostedContentStatus}
     * @memberof Work
     */
    status?: PostedContentStatus;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    language?: string;
    /**
     * 
     * @type {Array<WorkLink>}
     * @memberof Work
     */
    link?: Array<WorkLink>;
    /**
     * 
     * @type {ModelDate}
     * @memberof Work
     */
    deposited: ModelDate;
    /**
     * 
     * @type {number}
     * @memberof Work
     */
    score: number;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    degree?: string;
    /**
     * 
     * @type {Resources}
     * @memberof Work
     */
    resource: Resources;
    /**
     * 
     * @type {Array<string>}
     * @memberof Work
     */
    subtitle?: Array<string>;
    /**
     * 
     * @type {Array<Author>}
     * @memberof Work
     */
    translator?: Array<Author>;
    /**
     * 
     * @type {WorkFreeToRead}
     * @memberof Work
     */
    freeToRead?: WorkFreeToRead;
    /**
     * 
     * @type {Array<Author>}
     * @memberof Work
     */
    editor?: Array<Author>;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    proceedingsSubject?: string;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    componentNumber?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof Work
     */
    shortTitle?: Array<string>;
    /**
     * 
     * @type {DateParts}
     * @memberof Work
     */
    issued: DateParts;
    /**
     * 
     * @type {Array<string>}
     * @memberof Work
     */
    iSBN?: Array<string>;
    /**
     * 
     * @type {number}
     * @memberof Work
     */
    referencesCount?: number;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    partNumber?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof Work
     */
    issueTitle?: Array<string>;
    /**
     * 
     * @type {WorkJournalIssue}
     * @memberof Work
     */
    journalIssue?: WorkJournalIssue;
    /**
     * 
     * @type {Array<string>}
     * @memberof Work
     */
    alternativeId?: Array<string>;
    /**
     * 
     * @type {VersionInfo}
     * @memberof Work
     */
    version?: VersionInfo;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    uRL: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof Work
     */
    archive?: Array<string>;
    /**
     * 
     * @type {{ [key: string]: WorkRelationObject; }}
     * @memberof Work
     */
    relation?: { [key: string]: WorkRelationObject; };
    /**
     * 
     * @type {Array<string>}
     * @memberof Work
     */
    iSSN?: Array<string>;
    /**
     * 
     * @type {Array<WorkISSNType>}
     * @memberof Work
     */
    issnType?: Array<WorkISSNType>;
    /**
     * 
     * @type {Array<string>}
     * @memberof Work
     */
    subject?: Array<string>;
    /**
     * 
     * @type {DateParts}
     * @memberof Work
     */
    publishedOther?: DateParts;
    /**
     * 
     * @type {DateParts}
     * @memberof Work
     */
    published?: DateParts;
    /**
     * 
     * @type {Array<WorkAssertion>}
     * @memberof Work
     */
    assertion?: Array<WorkAssertion>;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    subtype?: string;
    /**
     * 
     * @type {string}
     * @memberof Work
     */
    articleNumber?: string;
}

/**
 * Check if a given object implements the Work interface.
 */
export function instanceOfWork(value: object): value is Work {
    if (!('indexed' in value) || value['indexed'] === undefined) return false;
    if (!('publisher' in value) || value['publisher'] === undefined) return false;
    if (!('dOI' in value) || value['dOI'] === undefined) return false;
    if (!('type' in value) || value['type'] === undefined) return false;
    if (!('created' in value) || value['created'] === undefined) return false;
    if (!('source' in value) || value['source'] === undefined) return false;
    if (!('prefix' in value) || value['prefix'] === undefined) return false;
    if (!('member' in value) || value['member'] === undefined) return false;
    if (!('deposited' in value) || value['deposited'] === undefined) return false;
    if (!('score' in value) || value['score'] === undefined) return false;
    if (!('resource' in value) || value['resource'] === undefined) return false;
    if (!('issued' in value) || value['issued'] === undefined) return false;
    if (!('uRL' in value) || value['uRL'] === undefined) return false;
    return true;
}

export function WorkFromJSON(json: any): Work {
    return WorkFromJSONTyped(json, false);
}

export function WorkFromJSONTyped(json: any, ignoreDiscriminator: boolean): Work {
    if (json == null) {
        return json;
    }
    return {
        
        'institution': json['institution'] == null ? undefined : ((json['institution'] as Array<any>).map(WorkInstitutionFromJSON)),
        'indexed': DateAndVersionFromJSON(json['indexed']),
        'posted': json['posted'] == null ? undefined : DatePartsFromJSON(json['posted']),
        'publisherLocation': json['publisher-location'] == null ? undefined : json['publisher-location'],
        'updateTo': json['update-to'] == null ? undefined : ((json['update-to'] as Array<any>).map(WorkUpdateFromJSON)),
        'standardsBody': json['standards-body'] == null ? undefined : ((json['standards-body'] as Array<any>).map(WorkStandardsBodyFromJSON)),
        'editionNumber': json['edition-number'] == null ? undefined : json['edition-number'],
        'groupTitle': json['group-title'] == null ? undefined : json['group-title'],
        'referenceCount': json['reference-count'] == null ? undefined : json['reference-count'],
        'publisher': json['publisher'],
        'issue': json['issue'] == null ? undefined : json['issue'],
        'isbnType': json['isbn-type'] == null ? undefined : ((json['isbn-type'] as Array<any>).map(WorkISSNTypeFromJSON)),
        'license': json['license'] == null ? undefined : ((json['license'] as Array<any>).map(WorkLicenseFromJSON)),
        'funder': json['funder'] == null ? undefined : ((json['funder'] as Array<any>).map(WorkFunderFromJSON)),
        'contentDomain': json['content-domain'] == null ? undefined : WorkDomainFromJSON(json['content-domain']),
        'chair': json['chair'] == null ? undefined : ((json['chair'] as Array<any>).map(AuthorFromJSON)),
        'shortContainerTitle': json['short-container-title'] == null ? undefined : json['short-container-title'],
        'accepted': json['accepted'] == null ? undefined : DatePartsFromJSON(json['accepted']),
        'contentUpdated': json['content-updated'] == null ? undefined : DatePartsFromJSON(json['content-updated']),
        'publishedPrint': json['published-print'] == null ? undefined : DatePartsFromJSON(json['published-print']),
        '_abstract': json['abstract'] == null ? undefined : json['abstract'],
        'dOI': json['DOI'],
        'type': json['type'],
        'created': ModelDateFromJSON(json['created']),
        'approved': json['approved'] == null ? undefined : DatePartsFromJSON(json['approved']),
        'page': json['page'] == null ? undefined : json['page'],
        'updatePolicy': json['update-policy'] == null ? undefined : json['update-policy'],
        'source': json['source'],
        'isReferencedByCount': json['is-referenced-by-count'] == null ? undefined : json['is-referenced-by-count'],
        'title': json['title'] == null ? undefined : json['title'],
        'prefix': json['prefix'],
        'volume': json['volume'] == null ? undefined : json['volume'],
        'clinicalTrialNumber': json['clinical-trial-number'] == null ? undefined : ((json['clinical-trial-number'] as Array<any>).map(WorkClinicalTrialFromJSON)),
        'author': json['author'] == null ? undefined : ((json['author'] as Array<any>).map(AuthorFromJSON)),
        'member': json['member'],
        'contentCreated': json['content-created'] == null ? undefined : DatePartsFromJSON(json['content-created']),
        'publishedOnline': json['published-online'] == null ? undefined : DatePartsFromJSON(json['published-online']),
        'reference': json['reference'] == null ? undefined : ((json['reference'] as Array<any>).map(ReferenceFromJSON)),
        'updatedBy': json['updated-by'] == null ? undefined : ((json['updated-by'] as Array<any>).map(WorkUpdateFromJSON)),
        'containerTitle': json['container-title'] == null ? undefined : json['container-title'],
        'review': json['review'] == null ? undefined : WorkReviewFromJSON(json['review']),
        'project': json['project'] == null ? undefined : WorkProjectFromJSON(json['project']),
        'originalTitle': json['original-title'] == null ? undefined : json['original-title'],
        'status': json['status'] == null ? undefined : PostedContentStatusFromJSON(json['status']),
        'language': json['language'] == null ? undefined : json['language'],
        'link': json['link'] == null ? undefined : ((json['link'] as Array<any>).map(WorkLinkFromJSON)),
        'deposited': ModelDateFromJSON(json['deposited']),
        'score': json['score'],
        'degree': json['degree'] == null ? undefined : json['degree'],
        'resource': ResourcesFromJSON(json['resource']),
        'subtitle': json['subtitle'] == null ? undefined : json['subtitle'],
        'translator': json['translator'] == null ? undefined : ((json['translator'] as Array<any>).map(AuthorFromJSON)),
        'freeToRead': json['free-to-read'] == null ? undefined : WorkFreeToReadFromJSON(json['free-to-read']),
        'editor': json['editor'] == null ? undefined : ((json['editor'] as Array<any>).map(AuthorFromJSON)),
        'proceedingsSubject': json['proceedings-subject'] == null ? undefined : json['proceedings-subject'],
        'componentNumber': json['component-number'] == null ? undefined : json['component-number'],
        'shortTitle': json['short-title'] == null ? undefined : json['short-title'],
        'issued': DatePartsFromJSON(json['issued']),
        'iSBN': json['ISBN'] == null ? undefined : json['ISBN'],
        'referencesCount': json['references-count'] == null ? undefined : json['references-count'],
        'partNumber': json['part-number'] == null ? undefined : json['part-number'],
        'issueTitle': json['issue-title'] == null ? undefined : json['issue-title'],
        'journalIssue': json['journal-issue'] == null ? undefined : WorkJournalIssueFromJSON(json['journal-issue']),
        'alternativeId': json['alternative-id'] == null ? undefined : json['alternative-id'],
        'version': json['version'] == null ? undefined : VersionInfoFromJSON(json['version']),
        'uRL': json['URL'],
        'archive': json['archive'] == null ? undefined : json['archive'],
        'relation': json['relation'] == null ? undefined : (mapValues(json['relation'], WorkRelationObjectFromJSON)),
        'iSSN': json['ISSN'] == null ? undefined : json['ISSN'],
        'issnType': json['issn-type'] == null ? undefined : ((json['issn-type'] as Array<any>).map(WorkISSNTypeFromJSON)),
        'subject': json['subject'] == null ? undefined : json['subject'],
        'publishedOther': json['published-other'] == null ? undefined : DatePartsFromJSON(json['published-other']),
        'published': json['published'] == null ? undefined : DatePartsFromJSON(json['published']),
        'assertion': json['assertion'] == null ? undefined : ((json['assertion'] as Array<any>).map(WorkAssertionFromJSON)),
        'subtype': json['subtype'] == null ? undefined : json['subtype'],
        'articleNumber': json['article-number'] == null ? undefined : json['article-number'],
    };
}

export function WorkToJSON(json: any): Work {
    return WorkToJSONTyped(json, false);
}

export function WorkToJSONTyped(value?: Work | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'institution': value['institution'] == null ? undefined : ((value['institution'] as Array<any>).map(WorkInstitutionToJSON)),
        'indexed': DateAndVersionToJSON(value['indexed']),
        'posted': DatePartsToJSON(value['posted']),
        'publisher-location': value['publisherLocation'],
        'update-to': value['updateTo'] == null ? undefined : ((value['updateTo'] as Array<any>).map(WorkUpdateToJSON)),
        'standards-body': value['standardsBody'] == null ? undefined : ((value['standardsBody'] as Array<any>).map(WorkStandardsBodyToJSON)),
        'edition-number': value['editionNumber'],
        'group-title': value['groupTitle'],
        'reference-count': value['referenceCount'],
        'publisher': value['publisher'],
        'issue': value['issue'],
        'isbn-type': value['isbnType'] == null ? undefined : ((value['isbnType'] as Array<any>).map(WorkISSNTypeToJSON)),
        'license': value['license'] == null ? undefined : ((value['license'] as Array<any>).map(WorkLicenseToJSON)),
        'funder': value['funder'] == null ? undefined : ((value['funder'] as Array<any>).map(WorkFunderToJSON)),
        'content-domain': WorkDomainToJSON(value['contentDomain']),
        'chair': value['chair'] == null ? undefined : ((value['chair'] as Array<any>).map(AuthorToJSON)),
        'short-container-title': value['shortContainerTitle'],
        'accepted': DatePartsToJSON(value['accepted']),
        'content-updated': DatePartsToJSON(value['contentUpdated']),
        'published-print': DatePartsToJSON(value['publishedPrint']),
        'abstract': value['_abstract'],
        'DOI': value['dOI'],
        'type': value['type'],
        'created': ModelDateToJSON(value['created']),
        'approved': DatePartsToJSON(value['approved']),
        'page': value['page'],
        'update-policy': value['updatePolicy'],
        'source': value['source'],
        'is-referenced-by-count': value['isReferencedByCount'],
        'title': value['title'],
        'prefix': value['prefix'],
        'volume': value['volume'],
        'clinical-trial-number': value['clinicalTrialNumber'] == null ? undefined : ((value['clinicalTrialNumber'] as Array<any>).map(WorkClinicalTrialToJSON)),
        'author': value['author'] == null ? undefined : ((value['author'] as Array<any>).map(AuthorToJSON)),
        'member': value['member'],
        'content-created': DatePartsToJSON(value['contentCreated']),
        'published-online': DatePartsToJSON(value['publishedOnline']),
        'reference': value['reference'] == null ? undefined : ((value['reference'] as Array<any>).map(ReferenceToJSON)),
        'updated-by': value['updatedBy'] == null ? undefined : ((value['updatedBy'] as Array<any>).map(WorkUpdateToJSON)),
        'container-title': value['containerTitle'],
        'review': WorkReviewToJSON(value['review']),
        'project': WorkProjectToJSON(value['project']),
        'original-title': value['originalTitle'],
        'status': PostedContentStatusToJSON(value['status']),
        'language': value['language'],
        'link': value['link'] == null ? undefined : ((value['link'] as Array<any>).map(WorkLinkToJSON)),
        'deposited': ModelDateToJSON(value['deposited']),
        'score': value['score'],
        'degree': value['degree'],
        'resource': ResourcesToJSON(value['resource']),
        'subtitle': value['subtitle'],
        'translator': value['translator'] == null ? undefined : ((value['translator'] as Array<any>).map(AuthorToJSON)),
        'free-to-read': WorkFreeToReadToJSON(value['freeToRead']),
        'editor': value['editor'] == null ? undefined : ((value['editor'] as Array<any>).map(AuthorToJSON)),
        'proceedings-subject': value['proceedingsSubject'],
        'component-number': value['componentNumber'],
        'short-title': value['shortTitle'],
        'issued': DatePartsToJSON(value['issued']),
        'ISBN': value['iSBN'],
        'references-count': value['referencesCount'],
        'part-number': value['partNumber'],
        'issue-title': value['issueTitle'],
        'journal-issue': WorkJournalIssueToJSON(value['journalIssue']),
        'alternative-id': value['alternativeId'],
        'version': VersionInfoToJSON(value['version']),
        'URL': value['uRL'],
        'archive': value['archive'],
        'relation': value['relation'] == null ? undefined : (mapValues(value['relation'], WorkRelationObjectToJSON)),
        'ISSN': value['iSSN'],
        'issn-type': value['issnType'] == null ? undefined : ((value['issnType'] as Array<any>).map(WorkISSNTypeToJSON)),
        'subject': value['subject'],
        'published-other': DatePartsToJSON(value['publishedOther']),
        'published': DatePartsToJSON(value['published']),
        'assertion': value['assertion'] == null ? undefined : ((value['assertion'] as Array<any>).map(WorkAssertionToJSON)),
        'subtype': value['subtype'],
        'article-number': value['articleNumber'],
    };
}

