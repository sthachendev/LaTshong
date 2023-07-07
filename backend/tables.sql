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
    applicants TEXT[] DEFAULT '{}',
    accepted_applicants TEXT[] DEFAULT '{}',
    rejected_applicants TEXT[] DEFAULT '{}'
    -- images TEXT[] DEFAULT '{}'
);