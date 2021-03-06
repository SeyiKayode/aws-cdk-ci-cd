import * as cdk from '@aws-cdk/core';
import { CdkPipeline, SimpleSynthAction } from '@aws-cdk/pipelines';

import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';

export class DatabaseStack extends cdk.Stack {
  // ...
}

export class ComputeStack extends cdk.Stack {
  // ...
}

export class MyApplication extends cdk.Stage {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);
    
    const dbStack = new DatabaseStack(this, 'Database');
    new ComputeStack(this, 'Compute', {
      // table: dbStack.table,
    });
  }
}

export class MyPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const pipeline = new CdkPipeline(this, 'Pipeline', {
      pipelineName: 'MyAppPipeline',
      cloudAssemblyArtifact,

      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: 'GitHub',
        output: sourceArtifact,
        oauthToken: cdk.SecretValue.secretsManager('GITHUB_TOKEN'),
        trigger: codepipeline_actions.GitHubTrigger.POLL,
        // Replace these with your actual GitHub project info
        owner: 'SeyiKayode',
        repo: 'aws-cdk-ci-cd',
      }),

      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,

        // Use this if you need a build step (if you're not using ts-node
        // or if you have TypeScript Lambdas that need to be compiled).
        buildCommand: 'npm run build',
      }),
    });

    pipeline.addApplicationStage(new MyApplication(this, 'Prod', {
      env: {
        account: '105727904871',
        region: 'us-east-1',
      }
    }));

    pipeline.addApplicationStage(new MyApplication(this, 'Dev', {
      env: {
        account: '105727904871',
        region: 'us-east-1',
      }
    }));
  }
}


