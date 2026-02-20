1. install aws cli
   --sudo apt update
   --sudo apt install awscli -y

2. aws configure --profile my-sst-user  
   --add the keys created for the specific user that you gave access

3. AWS_PROFILE=my-sst-user npx sst deploy  
   --deploy the app and create resources

4. AWS_PROFILE=my-sst-user npx sst remove
   --removes the aws resources
5. verify identity in ses to be able to send emails in sandbox mode
   --go to ses in aws and confirm your email
