import { s3 } from '@pulumi/aws';
import { Consts } from '../../../consts';

export default () =>
  new s3.Bucket(`${Consts.PROJECT_NAME}-audio`, {
    acl: 'private',
  });
