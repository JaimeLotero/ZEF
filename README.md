# ZEF Basic e-coin market

This project is a rendition of the specification at https://gist.github.com/zrumenjak/dfbd960482918a5ac0edf65c7453a14a

## Install

The only pre-requisites are `docker` and `docker-compose`

After making sure these are installed, clone the project and cd into the `docker` directory. Once there, run `docker-compose up`.

The server will listen on port `6565`. 

The database is pre-populated with sample values.

## Authentication

The project uses a very basic authentication scheme, it retrieves a user and a password from the headers `ZEFUser` and `ZEFPass`, in plain text.

An `admin` user is created upon database start up. Its user is `admin` and the password is `12345678`. This is the only user allowed to perform certain operations, as described below.

## Available endpoints

All endpoints receive their parameters as JSON.

**POST /member**

Create a new ZEF member, this endpoint does not require authentication.

Example body:
```
{
    "username": "member4",  // Username for logging in
    "name": "Member Four",  // Member name, can contain spaces
    "password": "some-password",  // Password string, no restrictions
    "email": "member4@test.com"  // Email
}
```

**POST /currency**

Create a currency to top up member balances, only the admin can create currencies.

Example body:
```
{
    "name": "EUR", // Name of the currency
    "kuna_ratio": 7 // Number of ZKN per unit of currency
}
```


**POST /project**

Create a project with an associated e-coin so other members can invest. Only members can create projects.

Example body:
```
{
    "name": "HelloCoin",  // Name of the project
    "currency": "HELLO",  // Project currency
    "exchange_rate": 200,  // Number of ZKN per unit of currency
    "cap": 1000  // Maximum available amount of currency
}
```


**PUT /project**

Update the investment terms of a project. Only the member that is the owner of the project can perform this operattion.
The request will return an error if trying to reduce the supply of the currency to an amount smaller than already owned by investors.
The change in `exchange_rate` does not modify the quantities owned by investors.
Example body:
```
{
    "currency": "HELLO",  // Project currency (Must be the one assigned at creation)
    "exchange_rate": 400,  // New exchange rate
    "cap": 500  // New maximum available amount
}
```

**GET /member**

Get all the information for the currently authenticated member, including investments if any. This request does not work for admins.

Example response:
```
{
{
    "name": "Member Three",  // Member name
    "email": "memb3@test.com",  // Member email
    "balance in ZKN": 77000,  // Account balance
    "investments": [  // Array of investments
        {
            "name": "Cinamon Coin",  // Project name
            "currency": "CIN",  // e-coin name
            "amount": 100  // Amount of e-coins owned from this project
        },
        {
            "name": "Mint Coin",
            "currency": "MINT",
            "amount": 1500
        }
    ]
}
}
```

**GET /member/balance**

Get the ZKN balance of the currently authenticated member. This request does not work for admins.

Example response:
```
{
    "balance": 77000,  // Account balance
}
```

*PUT /member/balance*
Add a certain amount of any currency to a member account balance. This operation can only be performed by an admin.

Example body:
```
{
    "member_id": 3,  // Member ID (Note that Member ID is not the same as username or User ID)
    "currency": "USD", // Currency name
    "amount": 2000 // Amount to add to the member's balance
}
```

**POST /trade/\<currency\>/\<e-coin\>**

Allows the currently authenticated member to buy e-coins from projects. An investment on the specified `e-coin` will be created with a value equivalent to the amount of `currencty` stated in the body.
If the member already had an investment on the project, the calculated value will be added to the existing investment.
The calculated value must not exceed the member's current balance.
If there is not enough `e-coin` supply for the operation, this call will return an error.
The calculated value in ZKN will be added to the project owner's balance in return for the investment.

Example body:
```
{
    "amount": 2000 // Amount of <currency> to invest
}
```

**POST /withdraw/<e-coin>**
Allows the currently authenticated member to withdraw their investment from a project. An amount of the specified `e-coin` will be withdrawn from the member's investment, and the equivalent ZKN value will be added back to their account balance. This same value will be subtracted from the project owner's ZKN balance.
The specified amount of e-coin will be added back to the project supply.

The calculated value must not exceed the project owner's current balance.
If there is not enough `e-coin` in the member's investment, this call will return an error.

Example body:
```
{
    "amount": 2000 // Amount of <currency> to invest
}
```

## Example

A Postman collection with all these endpoints is provided as an example in the file `postman-example.json`.

This service is deployed and available to test at `server-lotero.duckdns.org:6565`.


## Room for improvement

There are multiple ways in which this project can be improved, but time did not allow for their implementation. Some of them are:

* Improve security. The project uses a very basic security and authentication scheme, ideally OAuth could be used. Also sanitization of the input values is not implemented.
* Ensure some db operations are atomic. At the current state of the project, race conditions can occur when accessing tables concurrenctly, leading to potential introduction of inconsistencies.
* Make project more configurable. Variables like db password and application ports could be set as environment variables instead of being hard-coded.
* Make e-coin value consistent. Members could cheat the system by selling e-coins and then changing their exchange_rate; ideally, consistency on these values should be enforced by the application.
* Implement disaster-recovery mechanisms. If any database transaction fails, money from the users of the platform can become lost. There should be machanisms to avoid these situations, like a history of all attempted transactions for example.

