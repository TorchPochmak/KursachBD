
CREATE TABLE Person (
    Id SERIAL PRIMARY KEY,
    Organization VARCHAR(255),
    FirstName VARCHAR(100),
    LastName VARCHAR(100),
    Patronymic VARCHAR(100),
    CitizenShip VARCHAR(100),
    Description VARCHAR(255)
);


CREATE TABLE Client (
    Id SERIAL PRIMARY KEY,
    PersonId INTEGER NOT NULL UNIQUE REFERENCES Person(Id) 
        ON DELETE CASCADE,
    UserName VARCHAR(30),
    PassHash TEXT NOT NULL,
    IsAdmin BOOLEAN NOT NULL DEFAULT FALSE,
    Email VARCHAR(255),
    PhoneNumber VARCHAR(20),
    CONSTRAINT valid_email CHECK (Email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE Message (
    Id SERIAL PRIMARY KEY,
    FromId INTEGER NOT NULL REFERENCES Client(Id) 
        ON DELETE CASCADE,
    ToId INTEGER NOT NULL REFERENCES Client(Id) 
        ON DELETE CASCADE,
    DateCreated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Theme VARCHAR(255),
    Subject VARCHAR(255)
);

CREATE TABLE Market (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(20),
    SchemePng BYTEA,
    IsOpened BOOLEAN NOT NULL DEFAULT TRUE,
    PlacesCount INTEGER NOT NULL CHECK(PlacesCount > 0),
    OwnerId INTEGER NOT NULL REFERENCES Client(Id)
        ON DELETE CASCADE,
    Address VARCHAR(40)
);

CREATE TABLE Tradeplace (
    MarketId INTEGER NOT NULL,
    MarketNumber INTEGER NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    Info VARCHAR(200),
    OwnerId INTEGER NOT NULL REFERENCES Client(Id)
        ON DELETE CASCADE,

    PRIMARY KEY (MarketId, MarketNumber),
    FOREIGN KEY (MarketId) REFERENCES Market(Id)
        ON DELETE CASCADE,

    CONSTRAINT check_market_number CHECK (MarketNumber > 0),
    CONSTRAINT check_price CHECK (Price > 0)
);

CREATE TABLE Contract (
    Id SERIAL PRIMARY KEY,
    MarketId INTEGER NOT NULL,
    MarketNumber INTEGER NOT NULL,
    TenantId INTEGER NOT NULL REFERENCES Client(Id)
        ON DELETE CASCADE,
    DateCreated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    DaysCount INTEGER NOT NULL,
    FOREIGN KEY (MarketId, MarketNumber) REFERENCES Tradeplace(MarketId, MarketNumber)
        ON DELETE CASCADE
);


CREATE TABLE Event (
    EventId SERIAL PRIMARY KEY,  
    OwnerId INTEGER NOT NULL REFERENCES Client(Id)
        ON DELETE CASCADE,             
    EventName VARCHAR(30) NOT NULL,          
    Description VARCHAR(300) NOT NULL,                                
    StartDate TIMESTAMP NOT NULL,             
    EndDate TIMESTAMP NOT NULL       
);

CREATE OR REPLACE FUNCTION trg_check_placescount()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM Tradeplace
    WHERE MarketId = NEW.Id AND MarketNumber > NEW.PlacesCount;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_market_update
BEFORE UPDATE OF PlacesCount ON Market
FOR EACH ROW
WHEN (OLD.PlacesCount IS DISTINCT FROM NEW.PlacesCount)
EXECUTE FUNCTION trg_check_placescount();