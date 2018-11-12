const BaseProxy = require('componet-service-framework').baseProxy;
const resourceURI = require('../common/resourceURI');
const URIParser = resourceURI.v1;
const config = require('../config/config');

let ResourceNameType =
    {
        Resource_GradeRules:'gradeRules',
        Resource_MemberGrades:'memberGrades',
        Resource_Members:'members',
        Resource_AuthWxLogins:'weixinLogin',
    };

let proxyResourceMap = [
          {
              name:ResourceNameType.Resource_GradeRules,
              serverName:config.ThirdServerByCommonConfig.MEMBER_SERVER,
          },
          {
              name:ResourceNameType.Resource_MemberGrades,
              serverName:config.ThirdServerByCommonConfig.MEMBER_SERVER,
          },
            {
                name:ResourceNameType.Resource_Members,
                serverName:config.ThirdServerByCommonConfig.MEMBER_SERVER,
            },
            {
                name:ResourceNameType.Resource_AuthWxLogins,
                serverName:config.ThirdServerByCommonConfig.AUTH_SERVER,
            },
];

let resourceProxys = {};

proxyResourceMap.map(proxyResource=>{
    let proxy = new BaseProxy(proxyResource.name,proxyResource.serverName,URIParser.baseResourcesURI(proxyResource.serverName));
    resourceProxys[proxyResource.name] = proxy;
});


function getResourceProxy(resourceName) {
      return resourceProxys[resourceName];
}


exports.getResourceProxy = getResourceProxy;
exports.ResourceNameType = ResourceNameType;