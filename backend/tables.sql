-- tableSchema.sql

-- users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    --role em for employee and js for job seeker
    imageurl TEXT,
    bio TEXT
);

CREATE TABLE IF NOT EXISTS job_posts (
    id SERIAL PRIMARY KEY,
    job_title VARCHAR(100),
    job_description TEXT,
    job_requirements TEXT,
    job_salary VARCHAR(100),
    postby INTEGER NOT NULL,
    postdate TIMESTAMP, --
    location JSON, 
    status CHAR(1), ---a accept, r reject, d dispute
    applicants INTEGER[] DEFAULT '{}',
    accepted_applicants INTEGER[] DEFAULT '{}',
    rejected_applicants INTEGER[] DEFAULT '{}'
    -- images TEXT[] DEFAULT '{}'
);

-- chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
    id SERIAL PRIMARY KEY,
    room_id UUID NOT NULL,
    user1 INTEGER NOT NULL,
    user2 INTEGER NOT NULL
    -- ,
    -- FOREIGN KEY (user1) REFERENCES users (id),
    -- FOREIGN KEY (user2) REFERENCES users (id)
);

-- message table
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    room_id UUID NOT NULL,
    userid INTEGER NOT NULL,
    message TEXT NOT NULL,
    message_type CHAR(1) DEFAULT 't',
    --t for text
    --a for attachement
    date TIMESTAMP NOT NULL
);