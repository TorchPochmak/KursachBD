CREATE OR REPLACE FUNCTION get_user_by_email(p_email VARCHAR)
RETURNS TABLE (
    user_id INT,
    user_email VARCHAR,
    user_hashed_password TEXT,
    is_admin BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        Id AS user_id,
        Email AS user_email,
        PassHash AS user_hashed_password,
        IsAdmin AS is_admin
    FROM Client
    WHERE Email = p_email;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE PROCEDURE add_new_user(
    p_email VARCHAR,
    p_hashed_password TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    new_person_id INTEGER;
    is_first_user BOOLEAN;
BEGIN
    SELECT COUNT(*) = 0 INTO is_first_user FROM Client;

    INSERT INTO Person (
        Organization, FirstName, LastName, Patronymic, CitizenShip, Description
    )
    VALUES (
        NULL,  
        NULL, 
        NULL, 
        NULL,  
        NULL, 
        NULL  
    )
    RETURNING Id INTO new_person_id;

    INSERT INTO Client (
        PersonId, PassHash, IsAdmin, Email, PhoneNumber
    )
    VALUES (
        new_person_id,           
        p_hashed_password,
        is_first_user,
        p_email,
        NULL           
    );
END;
$$;

CREATE OR REPLACE FUNCTION get_all_markets()
RETURNS TABLE(
    Id INTEGER, 
    Name VARCHAR(20), 
    SchemePng BYTEA, 
    IsOpened BOOLEAN, 
    PlacesCount INTEGER, 
    OwnerId INTEGER, 
    Address VARCHAR(40)
) AS $$
BEGIN
    RETURN QUERY 
    SELECT Market.Id, Market.Name, Market.SchemePng, Market.IsOpened, 
           Market.PlacesCount, Market.OwnerId, Market.Address
    FROM Market;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE update_market(
    p_id INTEGER,
    p_name VARCHAR(20),
    p_scheme_png BYTEA,
    p_is_opened BOOLEAN,
    p_places_count INTEGER,
    p_owner_id INTEGER,
    p_address VARCHAR(40)
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE Market
    SET Name = p_name, SchemePng = p_scheme_png, IsOpened = p_is_opened,
        PlacesCount = p_places_count, OwnerId = p_owner_id, Address = p_address
    WHERE Id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_market(p_market_id INTEGER)
RETURNS TABLE(Id INTEGER, Name VARCHAR(20), SchemePng BYTEA, IsOpened BOOLEAN, PlacesCount INTEGER, OwnerId INTEGER, Address VARCHAR(40)) AS $$
BEGIN
    RETURN QUERY 
    SELECT Market.Id, Market.Name, Market.SchemePng, Market.IsOpened, Market.PlacesCount, Market.OwnerId, Market.Address
    FROM Market
    WHERE Market.Id = p_market_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE delete_market(p_market_id INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM Market WHERE Id = p_market_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Market not found';
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION create_default_market()
RETURNS TABLE (id INT, name VARCHAR(20), schemepng BYTEA, isopened BOOLEAN, placescount INT, ownerid INT, address VARCHAR(40)) AS $$
BEGIN
    RETURN QUERY
    INSERT INTO Market (Name, SchemePng, IsOpened, PlacesCount, OwnerId, Address) 
    VALUES ('NoName', NULL, TRUE, 1, 1, NULL)
    RETURNING Market.Id, Market.Name, Market.SchemePng, Market.IsOpened, Market.PlacesCount, Market.OwnerId, Market.Address;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_or_create_tradeplace(market_id INTEGER, market_number INTEGER)
RETURNS TABLE (
    MarketId INTEGER, 
    MarketNumber INTEGER, 
    Price DECIMAL(10, 2), 
    Info VARCHAR(200), 
    OwnerId INTEGER
) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        t.MarketId, 
        t.MarketNumber, 
        t.Price, 
        t.Info, 
        t.OwnerId
    FROM Tradeplace t 
    WHERE t.MarketId = market_id AND t.MarketNumber = market_number;

    IF NOT FOUND THEN
        INSERT INTO Tradeplace (MarketId, MarketNumber, Price, Info, OwnerId)
        VALUES (market_id, market_number, 0.01, 'no info', 1);

        RETURN QUERY 
        SELECT 
            t.MarketId, 
            t.MarketNumber, 
            t.Price, 
            t.Info, 
            t.OwnerId
        FROM Tradeplace t 
        WHERE t.MarketId = market_id AND t.MarketNumber = market_number;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE update_tradeplace(
    p_marketid INTEGER,
    p_marketnumber INTEGER,
    p_price DECIMAL(10, 2),
    p_info VARCHAR(200),
    p_ownerid INTEGER
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE Tradeplace
    SET Price = p_price, Info = p_info, OwnerId = p_ownerid
    WHERE MarketId = p_marketid AND MarketNumber = p_marketnumber;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tradeplace not found';
    END IF;
END;
$$;

CREATE OR REPLACE PROCEDURE delete_tradeplace(p_marketid INTEGER, p_marketnumber INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM Tradeplace WHERE MarketId = p_marketid AND MarketNumber = p_marketnumber;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tradeplace not found';
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION get_all_contracts()
RETURNS TABLE (
    id INTEGER, 
    marketid INTEGER, 
    marketnumber INTEGER, 
    tenantid INTEGER, 
    datecreated TIMESTAMP, 
    dayscount INTEGER, 
    price DECIMAL(10, 2), 
    info VARCHAR(200), 
    ownerid INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.Id AS id,
        c.MarketId AS marketid,
        c.MarketNumber AS marketnumber,
        c.TenantId AS tenantid,
        c.DateCreated AS datecreated,
        c.DaysCount AS dayscount,
        t.Price AS price,
        t.Info AS info,
        t.OwnerId AS ownerid
    FROM 
        Contract c
    JOIN 
        Tradeplace t
    ON 
        c.MarketId = t.MarketId AND c.MarketNumber = t.MarketNumber;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_all_contracts_concrete(user_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    marketid INTEGER,
    marketnumber INTEGER,
    tenantid INTEGER,
    datecreated TIMESTAMP,
    dayscount INTEGER,
    price DECIMAL(10, 2),
    info VARCHAR(200),
    ownerid INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.Id AS id,
        c.MarketId AS marketid,
        c.MarketNumber AS marketnumber,
        c.TenantId AS tenantid,
        c.DateCreated AS datecreated,
        c.DaysCount AS dayscount,
        t.Price AS price,
        t.Info AS info,
        t.OwnerId AS ownerid
    FROM 
        Contract c
    JOIN 
        Tradeplace t
    ON 
        c.MarketId = t.MarketId AND c.MarketNumber = t.MarketNumber
    WHERE c.TenantId = user_id OR t.OwnerId = user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE delete_contract(p_contract_id INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM Contract WHERE Id = p_contract_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contract not found';
    END IF;
END;
$$;

CREATE OR REPLACE PROCEDURE create_contract(
    p_marketid INTEGER,
    p_marketnumber INTEGER,
    p_tenantid INTEGER,
    p_datecreated TIMESTAMP,
    p_dayscount INTEGER
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO Contract (MarketId, MarketNumber, TenantId, DateCreated, DaysCount)
    VALUES (p_marketid, p_marketnumber, p_tenantid, p_datecreated, p_dayscount);
END;
$$;

CREATE OR REPLACE PROCEDURE delete_event(p_event_id INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM Event WHERE EventId = p_event_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Event not found';
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION get_all_events()
RETURNS TABLE (EventId INTEGER, OwnerId INTEGER, EventName VARCHAR(30), Description VARCHAR(300), StartDate TIMESTAMP, EndDate TIMESTAMP) AS $$
BEGIN
    RETURN QUERY
    SELECT Event.EventId, Event.OwnerId, Event.EventName, Event.Description, Event.StartDate, Event.EndDate FROM Event;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE create_event(
    p_event_name VARCHAR(30),
    p_owner_id INTEGER,
    p_description VARCHAR(300),
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO Event (EventName, OwnerId, Description, StartDate, EndDate)
    VALUES (p_event_name, p_owner_id, p_description, p_start_date, p_end_date);
END;
$$;

CREATE OR REPLACE FUNCTION check_client_exists(client_id INT) RETURNS BOOLEAN AS $$
DECLARE
    exists BOOLEAN;
BEGIN
    SELECT COUNT(1) > 0 INTO exists
    FROM Client
    WHERE id = client_id;
    RETURN exists;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_data_by_id(p_user_id INT)
RETURNS TABLE (
    client_id INT,
    client_username VARCHAR(100),
    client_email VARCHAR(255),
    client_is_admin BOOLEAN,
    client_phone_number VARCHAR(20),
    person_id INT,
    person_organization VARCHAR(255),
    person_first_name VARCHAR(100),
    person_last_name VARCHAR(100),
    person_patronymic VARCHAR(100),
    person_citizenship VARCHAR(100),
    person_description VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.Id AS client_id,
        c.UserName AS client_username,
        c.Email AS client_email,
        c.IsAdmin AS client_is_admin,
        c.PhoneNumber AS client_phone_number,
        p.Id AS person_id,
        p.Organization AS person_organization,
        p.FirstName AS person_first_name,
        p.LastName AS person_last_name,
        p.Patronymic AS person_patronymic,
        p.CitizenShip AS person_citizenship,
        p.Description AS person_description
    FROM Client c
    JOIN Person p ON c.PersonId = p.Id
    WHERE c.Id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE update_user_data(
    p_user_id INT,
    p_username VARCHAR(100) DEFAULT NULL,
    p_email VARCHAR(255) DEFAULT NULL,
    p_is_admin BOOLEAN DEFAULT FALSE,
    p_phone_number VARCHAR(20) DEFAULT NULL,
    p_organization VARCHAR(255) DEFAULT NULL,
    p_first_name VARCHAR(100) DEFAULT NULL,
    p_last_name VARCHAR(100) DEFAULT NULL,
    p_patronymic VARCHAR(100) DEFAULT NULL,
    p_citizenship VARCHAR(100) DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Person
    SET
        Organization = COALESCE(p_organization, Organization),
        FirstName = COALESCE(p_first_name, FirstName),
        LastName = COALESCE(p_last_name, LastName),
        Patronymic = COALESCE(p_patronymic, Patronymic),
        CitizenShip = COALESCE(p_citizenship, CitizenShip),
        Description = COALESCE(p_description, Description)
    WHERE Id = (SELECT PersonId FROM Client WHERE Id = p_user_id);

    UPDATE Client
    SET
        UserName = COALESCE(p_username, UserName),
        Email = COALESCE(p_email, Email),
        IsAdmin = COALESCE(p_is_admin, IsAdmin),
 
        PhoneNumber = COALESCE(p_phone_number, PhoneNumber)
    WHERE Id = p_user_id;
END;
$$;

CREATE OR REPLACE PROCEDURE add_message(
    p_from_id INTEGER,
    p_to_id INTEGER,
    p_theme VARCHAR(255),
    p_subject TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Message (FromId, ToId, Theme, Subject)
    VALUES (p_from_id, p_to_id, p_theme, p_subject); 
END;
$$;

CREATE OR REPLACE FUNCTION get_all_from_messages(fromi INT)
RETURNS TABLE (
    from_id INTEGER,
    to_id INTEGER,
    date_created TIMESTAMP,
    theme VARCHAR(255),
    subject VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.FromId as from_id,
        m.ToId as to_id,
        m.DateCreated as date_created,
        m.Theme as theme,
        m.Subject as subject
    FROM 
        Message m
    WHERE m.FromId = fromi;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_all_to_messages(toi INT)
RETURNS TABLE (
    from_id INTEGER,
    to_id INTEGER,
    date_created TIMESTAMP,
    theme VARCHAR(255),
    subject VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.FromId as from_id,
        m.ToId as to_id,
        m.DateCreated as date_created,
        m.Theme as theme,
        m.Subject as subject
    FROM 
        Message m
    WHERE m.ToId = toi;
END;
$$ LANGUAGE plpgsql;