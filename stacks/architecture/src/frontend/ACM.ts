import { acm, route53 } from '@pulumi/aws';
import { Frontend } from 'typings';
import { Consts, Envs } from '../../../consts';

export default (zone: route53.Zone): Frontend.CloudFront.ACMOutputs => {
  const cert = new acm.Certificate(
    'certificate.frontend',
    {
      domainName: `card.${Consts.DOMAIN_NAME()}`,
      validationMethod: 'DNS',
    },
    { provider: Envs.PROVIDER_US }
  );

  const record = new route53.Record('route53.record.frontend', {
    name: cert.domainValidationOptions[0].resourceRecordName,
    records: [cert.domainValidationOptions[0].resourceRecordValue],
    ttl: 60,
    type: cert.domainValidationOptions[0].resourceRecordType,
    zoneId: zone.id,
  });

  const validation = new acm.CertificateValidation(
    'certificate.validation.frontend',
    {
      certificateArn: cert.arn,
      validationRecordFqdns: [record.fqdn],
    },
    {
      customTimeouts: {
        create: '15m',
        update: '15m',
      },
      provider: Envs.PROVIDER_US,
    }
  );

  return {
    Certificate: cert,
    CertificateValidation: validation,
  };
};