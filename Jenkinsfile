pipeline {
  agent {
    kubernetes {
      defaultContainer 'tux-build'
      yaml """
kind: Pod
spec:
  serviceAccountName: jenkins-agent
  containers:
  - name: tux-build
    image: 934902905286.dkr.ecr.us-east-1.amazonaws.com/tux-automation:playwright
    imagePullPolicy: Always
    tty: true
    command:
    - /bin/sh
    args:
    - -c
    - "cat"
"""
    }
  }
  parameters {
    choice(name: 'PLAYWRIGHT_TEST', choices: ["HealthCheck", "Tealium", "SmartRFI", "SEO", "RFI", "Sitemap", "TuitionCalculator", "vrt"], description: "Choose what QA job you would like to run.")
    string(name: 'SITE_TAG', defaultValue: '', description: 'Type the pantheon tag of the sites you want to QA.')
    string(name: 'SITE_NAME', defaultValue: 'lp-bdt,lp-bpu', description: 'Type the site names you want to QA. Comma separated values allowed')
    string(name: 'ENV_NAME', defaultValue: 'live', description: 'Type the environment name you want to QA.')
    string(name: 'URLS', defaultValue: '', description: 'VRT ONLY.\nPlease, review the documentation about custom URLs: https://btcentral.atlassian.net/wiki/x/EAtGAw')
    booleanParam(name: 'PANTHEON_DOMAIN', defaultValue: false, description: 'VRT ONLY: Click this if you would like to use the pantheonsite.io domain for prod urls')
    string(name: 'THRESHOLD', defaultValue: '0.7', description: 'VRT ONLY: Type the threshold')
    string(name: 'QA_USER', defaultValue: 'Jenkins Automation', description: "Write your name as FirstName LastName. This will be used for any test, for ease of lead identification.\nIf you are running the VRT test, and you want the results emailed, please add a valid email instead.")
  }
  environment {
    TRIGGERED_BY_USER = ''
    TEALIUM_CREDENTIALS = "${params.TEALIUM_CREDENTIALS}"
    OPTIMIZELY_CREDENTIALS = "${params.OPTIMIZELY_CREDENTIALS}"
    ROLE_ARN = """${sh(
            returnStdout: true,
            script: '''
            if [ $ENVIRONMENT = 'prod' ]; then
              echo "arn:aws:iam::934902905286:role/jenkins/deploy/prod/LeadPipelineDeploy"
            else
              echo "arn:aws:iam::402982583524:role/jenkins/deploy/non-prod/TuxAutomationDeploy"
            fi
            '''
        ).trim()}"""
  }
  stages {
    stage('Prepare URLs') {
      steps {
        script {
          if (params.USE_URLS) {
            env.TEST_URLS = params.URLS
            echo "Using provided URLs: ${env.TEST_URLS}"
          } else {
            echo "Getting URLs from Pantheon..."

            def urlListResult = build job: 'Tux Automation/utilities/URL List/main',
              parameters: [
                string(name: 'PLAYWRIGHT_TEST', value: params.PLAYWRIGHT_TEST),
                string(name: 'SITE_TAG', value: params.SITE_TAG),
                string(name: 'SITE_NAME', value: params.SITE_NAME),
                string(name: 'ENV_NAME', value: params.ENV_NAME)
              ]

            // Get the URLs and site_info.json from the URL List job's artifacts
            copyArtifacts(
              projectName: 'Tux Automation/utilities/URL List/main',
              filter: '**/urls.txt, **/site_info.json',
              flatten: true,
              selector: specific("${urlListResult.number}")
            )

            // Read the URLs from the file
            def file_urls = readFile('urls.txt').trim()
            echo "Read URLs: ${file_urls}"
            env.TEST_URLS = file_urls
            echo "env.TEST_URLS (inside script): ${env.TEST_URLS}"
          }
        }
      }
    }
    stage('Running Test') {
      steps {
        container('tux-build') {
          script {
            echo "env.TEST_URLS (Running Test stage): ${env.TEST_URLS}"
            env.QA_USER = params.QA_USER
            sh(script: '''
              set +x
              echo "Assuming role with ARN: $ROLE_ARN"
              aws sts assume-role --role-arn $ROLE_ARN --role-session-name jenkins --duration-seconds 3600 > /tmp/sts || { echo "Failed to assume role"; exit 1; }
              export AWS_ACCESS_KEY_ID=`jq -r '.Credentials.AccessKeyId' /tmp/sts`
              export AWS_SECRET_ACCESS_KEY=`jq -r '.Credentials.SecretAccessKey' /tmp/sts`
              export AWS_SESSION_TOKEN=`jq -r '.Credentials.SessionToken' /tmp/sts`
              rm /tmp/sts
              git config --global user.email "seandgiddings@gmail.com"
              git config --global user.name "Sean Giddings"
              set -x
              echo "Running Playwright tests..."
              npm install || { echo "npm install failed"; exit 1; }
              npm run test:"$PLAYWRIGHT_TEST" || { echo "Playwright tests failed"; exit 1; }
            ''')
          }
        }
      }
    }
  }
}
