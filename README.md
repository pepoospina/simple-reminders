# Simple Reminders

A simple app to practice AWS SAM, API Gateway, Lambda, S3, DynamoDB, and Email notifications.

You need AWS CLI and SAM CLI installed and configured (authenticated to admin an AWS Account). You also need docker.

## Comments on the App Architecture

- We use SAM CLI to manage the deployment of the app.
- We use one function to handle all API requests and `express` to route inside. This was preferred over per route gateway paths where logic would be split between SAM config and TS code.
- We use one scheduled function triggered every minute to check for pending reminders. This was preferred over complex delayed execution configurations (its simpler and cheaper).
- We use a class based architecture with clear dependencies through constructor injection. This helps with testing and makes the code more maintainable.
- Some simple, useful but not exhaustive tests were used to facilitate the development process. One integration test was needed to check SES was working locally. This test is disabled.
- We preferred the use secondary indexes on DynamoDB over inmemory filtering to get reminders by date.
- I build a simple frontend application to test the API. Its functional. There are many improvements that could be made, but its pretty useful.

## Run Tests

```
cd stack/functions
yarn install
```

```
yarn launch:dynamo
yarn test
```

## Run API locally

Go into the `stack` folder again and run

```
yarn launch:dynamo
yarn start
```

You can run the frontend locally (see below) and will have a working app.

## Deploy

You need to replace the AWS profile.

Replace "AdministratorAccess-245826160985" from `stack/package.json` and `stack/samconfig.toml` with your profile name.

(For some reason setting the default profile to aws cli was not reliably working)

You need to prepare SES to send emails. Go to the AWS Console, create a SES Instance and verify the email address and the domain you want to use to send emails. In this case I verified `pepo.is` and `pepo.ospina@gmail.com`

Then replace these values in `stack/template.yaml` inside the `RemindersCronJob` resource.

Here

```
EMAIL_FROM: "noreply@pepo.is"
EMAIL_TO: "pepo.ospina@gmail.com"
```

and here

```
Policies:
    - SESCrudPolicy:
        IdentityName: "pepo.is"
    - SESCrudPolicy:
        IdentityName: "pepo.ospina@gmail.com"
```

Then deploy using

```
yarn deploy
```

Note the API URL from the output.

## Frontend

Go into the app folder, create an .env file with the API URL and run

```
REACT_APP_API_URL=<The output from the deploy command>
```

```
yarn install
yarn build
```

To run locally

```
yarn start
```

To deploy, go back to the `stack` folder and run

```
yarn deploy-webapp
```

## TIMESHEET

- May 20: 0.45h - Setup api from template
- May 21: 4.30h - Deploy, connect frontend, build tests, connect DB
- May 21: 2.30h - Configure local emulation, deploy to aws. CRUD working.
- May 22: 6.00h - Setup email service, test locally, debug on deployment, working.
