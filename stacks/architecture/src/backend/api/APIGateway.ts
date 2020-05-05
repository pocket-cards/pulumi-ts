import { interpolate } from '@pulumi/pulumi';
import { apigatewayv2 } from '@pulumi/aws';
import { Consts, Envs } from '../../../../consts';
import { Backend } from 'typings';

export default (inputs: Backend.CognitoOutputs): Backend.API.APIGatewayOutputs => {
  const api = new apigatewayv2.Api('apigateway.api.backend', {
    name: Consts.PROJECT_NAME,
    protocolType: 'HTTP',
  });

  const integration = new apigatewayv2.Integration(
    'apigateway.integration',
    {
      apiId: api.id,
      integrationType: 'HTTP_PROXY',
      integrationMethod: 'ANY',
      integrationUri: 'http://13.231.186.142',
      passthroughBehavior: 'WHEN_NO_MATCH',
    },
    {
      ignoreChanges: ['integrationUri'],
    }
  );

  const authorizer = new apigatewayv2.Authorizer('apigateway.authorizer', {
    name: 'Cognito',
    apiId: api.id,
    authorizerType: 'JWT',
    identitySources: ['$request.header.Authorization'],
    jwtConfiguration: {
      audiences: [inputs.UserPoolClient.id],
      issuer: interpolate`https://cognito-idp.${Envs.DEFAULT_REGION}.amazonaws.com/${inputs.UserPool.id}`,
    },
  });

  const route = new apigatewayv2.Route('apigateway.route', {
    apiId: api.id,
    routeKey: '$default',
    authorizationType: 'JWT',
    authorizerId: authorizer.id,
    target: interpolate`integrations/${integration.id}`,
  });

  const stage = new apigatewayv2.Stage(
    'apigateway.stage',
    {
      name: '$default',
      apiId: api.id,
      autoDeploy: true,
      description: 'Example ',
    },
    { ignoreChanges: ['deploymentId'] }
  );

  return {
    API: api,
    Authorizer: authorizer,
    Integration: integration,
    Route: route,
    Stage: stage,
  };
};