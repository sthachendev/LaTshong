-- tableSchema.sql

-- users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    cid VARCHAR(11),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    --role em for employee and js for job seeker
    --admin
    imageurl TEXT[] DEFAULT '{}',
    bio TEXT,
    created_on TIMESTAMP NOT NULL
);

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
    postby INTEGER NOT NULL,
    postdate TIMESTAMP, --
    closedate TIMESTAMP, --
    location JSON, 
    status CHAR(1), ---o open, c close
    applicants INTEGER[] DEFAULT '{}',
    accepted_applicants INTEGER[] DEFAULT '{}'
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
    message_type CHAR(1) DEFAULT 't',--- t text, a attachment applications, mp3, mp4, (video/ audio)
    --t for text
    --a for attachement
    --i for image
    date TIMESTAMP NOT NULL
);

-- Creating the 'attachment_details' table
CREATE TABLE IF NOT EXISTS attachment_details (
    id BIGSERIAL PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_uri TEXT NOT NULL,
    file_type VARCHAR(255),
    message_id BIGINT NOT NULL,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    -- _desc TEXT,
    images TEXT[] DEFAULT '{}',
    -- media_type CHAR(1), --p for posts, c for certificates
    postby INTEGER NOT NULL,
    postdate TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feed_posts (
    id BIGSERIAL PRIMARY KEY,
    _desc TEXT,
    media_uri TEXT[] DEFAULT '{}',
    media_type CHAR(1), --p pictures, v video
    postby INTEGER NOT NULL,--userid
    postdate TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_saved_posts (
    id SERIAL PRIMARY KEY,
    postid INTEGER[] DEFAULT '{}',
    userid INTEGER NOT NULL
);