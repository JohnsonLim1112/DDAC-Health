# DDAC Backend (AWS)

A .NET-based backend API project using PostgreSQL, deployed on AWS Elastic Beanstalk.

## Available Swagger Interfaces

You can test the API using either of these Swagger UIs (both should be working):

- **Elastic Beanstalk (recommended stable URL)**  
  http://backend-api-dev.us-east-1.elasticbeanstalk.com/swagger/index.html

- **Temporary direct IP** (may change in the future)  
  http://44.206.59.42/swagger/index.html

## Quick Start – Local Development

### 1. Set up the Database

1. Go to the `SQL/` folder in the project
2. Find the latest `.sql` file (usually `create_database.sql` or `init.sql`)
3. Execute it using your preferred PostgreSQL client:  
   - pgAdmin  
   - DBeaver  
   - TablePlus  
   - psql command line, etc.

### 2. Configure the Database Connection

1. Open `Backend/appsettings.json` (or `appsettings.Development.json` if you have it)
2. Update the `PostgresConnection` string with **your own** PostgreSQL connection details:

```json
"PostgresConnection": "Host=localhost;Port=5432;Database=ddac_dev;Username=postgres;Password=your_password"