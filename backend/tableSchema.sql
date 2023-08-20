-- users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    -- cid VARCHAR(11) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    --role em for employee and js for job seeker
    --admin
    imageurl TEXT[] DEFAULT '{}',
    bio TEXT,
    created_on TIMESTAMP NOT NULL,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'not verified'
    ---verified, not verified and pending
);

--accountverification request table
-- CREATE TABLE IF NOT EXISTS account_verification_requests (
--         id INTEGER PRIMARY KEY,
--         user_id BIGSERIAL,
--         account_verified_on DATETIME,
--         status TEXT ---false, true, pending
--     )

-- job_posts table with ON DELETE CASCADE
CREATE TABLE IF NOT EXISTS job_posts (
    id BIGSERIAL PRIMARY KEY,
    job_title VARCHAR(255),
    job_description TEXT,
    nature VARCHAR(255),
    vacancy_no VARCHAR(255),
    job_requirements TEXT,
    job_salary VARCHAR(255),
    location_ VARCHAR(255),
    remark TEXT,
    postby INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    postdate TIMESTAMP,
    closedate TIMESTAMP,
    location JSON, 
    status CHAR(1),---o open, c close
    applicants INTEGER[] DEFAULT '{}',
    accepted_applicants INTEGER[] DEFAULT '{}',
    reportedby INTEGER[] DEFAULT '{}'
);

-- chat_rooms table with ON DELETE CASCADE
CREATE TABLE IF NOT EXISTS chat_rooms (
    id SERIAL PRIMARY KEY,
    room_id UUID NOT NULL,
    user1 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- message table with ON DELETE CASCADE
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    room_id UUID NOT NULL,
    userid INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type CHAR(1) DEFAULT 't',--- t text, a attachment applications, mp3, mp4, (video/ audio)
    --t for text
    --a for attachement
    --i for image
    date TIMESTAMP NOT NULL,
    unread BOOLEAN NOT NULL DEFAULT TRUE -- Set the default value as true to indicate unread messages
);

-- Creating the 'attachment_details' table with ON DELETE CASCADE
CREATE TABLE IF NOT EXISTS attachment_details (
    id BIGSERIAL PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_uri TEXT NOT NULL,
    file_type VARCHAR(255),
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE
);

-- posts table with ON DELETE CASCADE
CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    images TEXT[] DEFAULT '{}',
    postby INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    postdate TIMESTAMP
);

-- feed_posts table with ON DELETE CASCADE
CREATE TABLE IF NOT EXISTS feed_posts (
    id BIGSERIAL PRIMARY KEY,
    _desc TEXT,
    media_uri TEXT[] DEFAULT '{}',
    media_type CHAR(1), ---p pictures v video
    postby INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    postdate TIMESTAMP,
    reportedby INTEGER[] DEFAULT '{}'
);

-- user_saved_posts table with ON DELETE CASCADE
CREATE TABLE IF NOT EXISTS user_saved_posts (
    id SERIAL PRIMARY KEY,
    postid INTEGER[] DEFAULT '{}',
    userid INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
