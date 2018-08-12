# nilslutz.de

Architecture of my website [http://nilslutz.de](http://nilslutz.de).

## Instructions

#### Clone repo

```
git clone https://github.com/nlsltz/nilslutz.de
```

#### Copy env-files

```
cp ghost-vars.example.env ghost-vars.env
cp mariadb-vars.example.env mariadb-vars.example
```

> _Edit environment variables in both files to your personal settings!_

#### Start service

```
docker-compose up -d
```

On first start up it may take one minute to have the service loaded and running depending on your underlying Docker host configurations.

Access service at public dns set in environment variables.

#### Important Passwords

- [`GHOST_DATABASE_PASSWORD`](ghost-vars.example.env)
- [`GHOST_PASSWORD`](ghost-vars.example.env)
- [`MARIADB_ROOT_PASSWORD`](mariadb-vars.example.env)
- [`MARIADB_PASSWORD`](mariadb-vars.example.env)

## TODO

- Backup

  - ~~Container controlling lifecycle of service and has access to service container data volumes~~
  - ~~Backup script to compress the data and send to off-site location~~
  - ~~Evaluate off-site locations (AWS S3)~~
  - Backup rotation to save storage and only keep the last two backups
  - Docs how-to create S3 bucket and configure local awscli to use backup script
  - Cronjob example

---

Copyright (c) Nils Lutz - 2018
