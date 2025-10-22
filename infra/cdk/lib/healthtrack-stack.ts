import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class HealthTrackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // 👉 acá adentro definís los recursos de tu infraestructura
  }
}
