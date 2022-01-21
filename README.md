# Instruction

- Create folder "certs" to store private key and certificate file.
- Change key name to private.pem.key, certificate.pem.crt, rootCA1.pem
- Create ".env" file to define environment variables

## Environment

| VARIABLE             | Description               |
| -------------------- | ------------------------- |
| AWS_PRIVATE_KEY_PATH | certs/private.pem.key     |
| AWS_CERT_PATH        | certs/certificate.pem.crt |
| AWS_CA_PATH          | certs/rootCA1.pem         |
| CLIENT_ID            | thingName on AWS          |
| AWS_HOST             | AWS Host                  |

```
# .env file
AWS_PRIVATE_KEY_PATH=certs/private.pem.key
AWS_CERT_PATH=certs/certificate.pem.crt
AWS_CA_PATH=certs/rootCA1.pem
CLIENT_ID=61dd36e2cad78b8b8882ed4dxx
AWS_HOST=ash0p3o5d1jwl-ats.iot.ap-southeast-1.amazonaws.com
```

## Install packages

```
npm install
```

## Run

```
npm test
```
