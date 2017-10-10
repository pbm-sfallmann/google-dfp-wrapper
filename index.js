const Promise = require('bluebird');
const Dfp = require('node-google-dfp');
const google = require('googleapis');


function GoogleDfpWrapperFactory() {

  const servicesNames = [
    'ActivityGroupService', 'ActivityService', 'AdExclusionRuleService',
    'AdRuleService', 'AudienceSegmentService', 'BaseRateService', 'CompanyService',
    'ContactService', 'ContentBundleService', 'ContentMetadataKeyHierarchyService',
    'ContentService', 'CreativeService', 'CreativeSetService', 'CreativeTemplateService',
    'CreativeWrapperService', 'CustomFieldService', 'CustomTargetingService',
    'ExchangeRateService', 'ForecastService', 'InventoryService', 'LabelService',
    'LineItemCreativeAssociationService', 'LineItemService', 'LineItemTemplateService',
    'MobileApplicationService', 'NativeStyleService', 'NetworkService', 'OrderService',
    'PackageService', 'PlacementService', 'PremiumRateService', 'ProductPackageItemService',
    'ProductPackageService', 'ProductService', 'ProductTemplateService',
    'ProposalLineItemService', 'ProposalService', 'PublisherQueryLanguageService',
    'RateCardService', 'ReconciliationLineItemReportService', 'ReconciliationOrderReportService',
    'ReconciliatioReportRowService', 'ReconciliatioReportService', 'ReportService',
    'SuggestedAdUnitService', 'TeamService', 'UserService', 'UserTeamAssociationService',
    'WorkfloeRequestService'
  ]

  const createServicesObj = (dfpUser) => {

    const services = {};

    const getService = (serviceName) => {
      return new Promise((resolve, reject) => {
        dfpUser.getService(serviceName, (err, service) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          resolve(service)
        });
      })
    }
  
    const makeRequest = (serviceName, methodName, args) => {
      return getService(serviceName)
        .then((_service) => {

          if (args === null || args === undefined){
            throw new Error('args is null or undefined');
          }
          const _method = Promise.promisify(_service[methodName]);

          switch(typeof args) {
            case 'string': 
              return _method(new Dfp.Statement(args));
              break;
            case 'object':
              return _method(args);
              break;
            default: 
              throw new Error('args formt unrecognized')
          }
    
          return _method(args);
          
        })
    }


    servicesNames.forEach(function(name) {
      services[name] = (method, args) => {
        return makeRequest(name, method, args);
      }
    })

    return services;
  }
  

  const create = (options) => {

    let {pemFilePath, clientEmail, scope, networkCode, projectId, version} = options;

    const jwtClient = new google.auth.JWT(
      clientEmail,
      pemFilePath,
      null,
      scope
    )

    const dfpUser = new Dfp.User(networkCode, projectId, version);
    dfpUser.setClient(jwtClient);
    return new DfpClient(dfpUser);
  }

  class DfpClient {
    constructor(dfpUser){
      this.services = createServicesObj(dfpUser);
      this.Statement = Dfp.Statement;
      this.Money = Dfp.Money;
      this.DfpDate = Dfp.DfpDate;
      this.assetByteArray = Dfp.assetByteArray;
    }
  }

  return {
    create
  }

}


module.exports = GoogleDfpWrapperFactory();

