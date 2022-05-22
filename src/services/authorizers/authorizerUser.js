export const handler = async event => {
  try {
    const accessToken = event.headers["cplus-authorization"];
    const origin = event.headers["origin"] || event.headers["Origin"];
    if (!accessToken || !origin) {
      return generatePolicy("user", "Deny", event.methodArn);
    }
    return generatePolicy("user", "Allow", event.methodArn);
  } catch (error) {
    console.error(error);
    return generatePolicy("user", "Deny", event.methodArn);
  }
};

const generatePolicy = function(principalId, effect, resource = "*") {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};
