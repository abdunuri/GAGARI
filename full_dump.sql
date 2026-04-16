--
-- PostgreSQL database dump
--

\restrict 6yDCDQvneSUEaoFgoa5bclh3cZ5sKWxzbxntgI0eIjPoBObvlFp9HAQlWcNtZmL

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: Category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Category" AS ENUM (
    'BREAD',
    'FASTF',
    'CAKE'
);


--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PAID',
    'CANCELLED'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'OWNER',
    'STAFF',
    'VIEWER'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Bakery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Bakery" (
    id integer NOT NULL,
    name text NOT NULL,
    "ownerId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Bakery_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Bakery_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Bakery_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Bakery_id_seq" OWNED BY public."Bakery".id;


--
-- Name: Customer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Customer" (
    id integer NOT NULL,
    name text NOT NULL,
    "phoneNumber" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "bakeryId" integer NOT NULL,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Customer_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Customer_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Customer_id_seq" OWNED BY public."Customer".id;


--
-- Name: Item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Item" (
    id integer NOT NULL,
    name text NOT NULL,
    price numeric(10,2) NOT NULL,
    "bakeryId" integer NOT NULL,
    "createdById" text NOT NULL,
    category public."Category" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Item_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Item_id_seq" OWNED BY public."Item".id;


--
-- Name: Order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "customerId" integer NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "bakeryId" integer NOT NULL,
    "createdById" text NOT NULL
);


--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderItem" (
    id integer NOT NULL,
    "isRemoved" boolean DEFAULT false NOT NULL,
    "itemId" integer NOT NULL,
    "orderId" text NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: OrderItem_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."OrderItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: OrderItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."OrderItem_id_seq" OWNED BY public."OrderItem".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account (
    id text NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp(3) without time zone,
    "refreshTokenExpiresAt" timestamp(3) without time zone,
    scope text,
    password text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    id text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id text NOT NULL,
    name text NOT NULL,
    username text,
    email text,
    role public."Role" NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "bakeryId" integer
);


--
-- Name: verification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Bakery id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Bakery" ALTER COLUMN id SET DEFAULT nextval('public."Bakery_id_seq"'::regclass);


--
-- Name: Customer id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Customer" ALTER COLUMN id SET DEFAULT nextval('public."Customer_id_seq"'::regclass);


--
-- Name: Item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Item" ALTER COLUMN id SET DEFAULT nextval('public."Item_id_seq"'::regclass);


--
-- Name: OrderItem id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem" ALTER COLUMN id SET DEFAULT nextval('public."OrderItem_id_seq"'::regclass);


--
-- Data for Name: Bakery; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Bakery" (id, name, "ownerId", "createdAt", "updatedAt") FROM stdin;
1	ZAD	cmnzn7pwi00003onrfsddsvr1	2026-04-15 08:38:04.326	1969-12-31 21:00:00
\.


--
-- Data for Name: Customer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Customer" (id, name, "phoneNumber", "isActive", "bakeryId", "createdById", "createdAt", "updatedAt") FROM stdin;
2	Ibrahim	0987654321	t	1	cmnzn7pwi00003onrfsddsvr1	2026-04-15 08:48:18.381	1969-12-31 21:00:00
3	Abdellah	0987654321	t	1	cmnzn7pwi00003onrfsddsvr1	2026-04-15 09:25:33.366	2026-04-15 09:25:33.366
4	Abdellah	0987654321	t	1	cmnzn7pwi00003onrfsddsvr1	2026-04-15 09:29:02.809	2026-04-15 09:29:02.809
5	Ahmed Mohammed	0987654321	t	1	cmnzn7pwi00003onrfsddsvr1	2026-04-15 15:21:17.974	2026-04-15 15:21:17.974
6	Abel habt	0987654321	t	1	cmnzn7pwi00003onrfsddsvr1	2026-04-15 18:45:55.374	2026-04-15 18:45:55.374
7	mohammed	0987654321	t	1	cmnzn7pwi00003onrfsddsvr1	2026-04-15 18:47:23.224	2026-04-15 18:47:23.224
\.


--
-- Data for Name: Item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Item" (id, name, price, "bakeryId", "createdById", category, "createdAt", "updatedAt") FROM stdin;
1	Bread_10	10.00	1	cmnzn7pwi00003onrfsddsvr1	BREAD	2026-04-15 08:51:10.236	1969-12-31 21:00:00
2	Bread 20	20.00	1	cmnzn7pwi00003onrfsddsvr1	BREAD	2026-04-15 21:56:26.205	2026-04-15 21:56:26.205
3	Bombolino	30.00	1	cmnzn7pwi00003onrfsddsvr1	FASTF	2026-04-15 21:57:30.356	2026-04-15 21:57:30.356
4	Doughnut	50.00	1	cmnzn7pwi00003onrfsddsvr1	FASTF	2026-04-15 22:04:54.839	2026-04-15 22:04:54.839
5	Slice	60.00	1	cmnzn7pwi00003onrfsddsvr1	BREAD	2026-04-15 22:05:33.586	2026-04-15 22:05:33.586
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Order" (id, "customerId", status, "createdAt", "updatedAt", "bakeryId", "createdById") FROM stdin;
cmnzn7pwi00003onrfsddsvr1	2	PENDING	2026-04-15 06:01:51.33	2026-04-15 06:01:51.33	1	cmnzn7pwi00003onrfsddsvr1
cmnznn8lz00023onrxp572j91	2	PENDING	2026-04-15 06:13:55.416	2026-04-15 06:13:55.416	1	cmnzn7pwi00003onrfsddsvr1
cmo15pgxh00002snruipmi7ag	7	PENDING	2026-04-16 07:27:18.773	2026-04-16 07:27:18.773	1	cmnzn7pwi00003onrfsddsvr1
cmo16gxrz00012snryzs9tt4k	5	PENDING	2026-04-16 07:48:40.32	2026-04-16 07:48:40.32	1	cmnzn7pwi00003onrfsddsvr1
cmo18p7260000twnrfiu3xwkv	6	PENDING	2026-04-16 08:51:04.831	2026-04-16 08:51:04.831	1	cmnzn7pwi00003onrfsddsvr1
cmo1gncwn0000m4nrpjuqqsox	3	PENDING	2026-04-16 12:33:36.023	2026-04-16 12:33:36.023	1	d5KmHAy8Cm8tqYESO1yrjbCquuxPKsWd
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrderItem" (id, "isRemoved", "itemId", "orderId", "unitPrice", quantity, "createdAt", "updatedAt") FROM stdin;
3	f	1	cmnzn7pwi00003onrfsddsvr1	10.00	10	2026-04-15 06:01:51.33	2026-04-15 06:01:51.33
4	f	1	cmnznn8lz00023onrxp572j91	20.00	200	2026-04-15 06:13:55.416	2026-04-15 06:13:55.416
5	f	1	cmo15pgxh00002snruipmi7ag	0.00	10	2026-04-16 07:27:18.773	2026-04-16 07:27:18.773
6	f	2	cmo15pgxh00002snruipmi7ag	0.00	10	2026-04-16 07:27:18.773	2026-04-16 07:27:18.773
7	f	1	cmo16gxrz00012snryzs9tt4k	10.00	10	2026-04-16 07:48:40.32	2026-04-16 07:48:40.32
8	f	4	cmo16gxrz00012snryzs9tt4k	50.00	3	2026-04-16 07:48:40.32	2026-04-16 07:48:40.32
9	f	5	cmo16gxrz00012snryzs9tt4k	60.00	1	2026-04-16 07:48:40.32	2026-04-16 07:48:40.32
10	f	1	cmo18p7260000twnrfiu3xwkv	10.00	15	2026-04-16 08:51:04.831	2026-04-16 08:51:04.831
11	f	4	cmo1gncwn0000m4nrpjuqqsox	50.00	1	2026-04-16 12:33:36.023	2026-04-16 12:33:36.023
12	f	3	cmo1gncwn0000m4nrpjuqqsox	30.00	5	2026-04-16 12:33:36.023	2026-04-16 12:33:36.023
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
8ffd457d-efdd-4706-bb7c-7465e53b64d9	9674993ab33777aac0c724be3da908b1803d4048b0389209ba1345bd17cccb89	2026-04-12 17:43:07.853948+03	20260406195819_create_user	\N	\N	2026-04-12 17:43:07.818053+03	1
43aa5472-759c-4bf4-860e-0330f68f6e28	6b5ef241c03329f15f97d4b8db4286b74e5dbb7700e4008b81a7b681d8086b90	2026-04-12 17:43:07.873697+03	20260406202723_add_role_enum	\N	\N	2026-04-12 17:43:07.856912+03	1
83dc6563-167f-47ec-a80e-fce56effbb90	0d0f53532194e40472a96d69a859f0dc6f922c8581a53503868a3cffafbab1d6	2026-04-12 17:43:08.064455+03	20260408085520_initial_models_user_customer_order_item	\N	\N	2026-04-12 17:43:07.87663+03	1
13c29c44-c0e9-42f8-bca4-1107f6380c12	47f7baca7296af7e2f2e259961f0630b3c0015eb53f1d09858a0e77118c98666	2026-04-12 17:43:08.147952+03	20260409115330_backery_introduced	\N	\N	2026-04-12 17:43:08.067096+03	1
71367f82-bf0a-4d54-98b0-5d617d39be48	efb62dbff2e0b04ef030faa742f61ae0aba56a3dfe650a17ff031bbf0d1afe6a	2026-04-12 17:43:08.210035+03	20260411071910_creation_loop_fixed	\N	\N	2026-04-12 17:43:08.14985+03	1
6f0de1a7-bf6a-45c6-90fa-aeeaa303f503	92f4a607b03040512b7b10fbe084f98c98099ba910fab7daa98bb5f8b9ff314f	2026-04-12 17:43:08.42105+03	20260412143823_auth_added	\N	\N	2026-04-12 17:43:08.212111+03	1
966d2b57-7e7d-48d5-95a3-0f9f5dcef857	3bf5175e8578b378ae250ad86af989b61009a5aef20a005eb5c670c369c210a3	2026-04-13 11:11:46.779541+03	20260413081146_role	\N	\N	2026-04-13 11:11:46.715503+03	1
\.


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.account (id, "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt") FROM stdin;
NsE9M8dGUP6N59KZlj98cFSPP8Vn27kg	mDW7hHoyGxNW2VMlyVdCOXpknh92d5FB	credential	cmnzn7pwi00003onrfsddsvr1	\N	\N	\N	\N	\N	\N	a64123387a7a43192d0e7105e90d2c2d:5ff3c4682c68603d0bde117a2441ad95bde71b0b4ef3f2bba153450cc21f42351cff4344036576ebb2131a6761e4a0f0d93e3682105677dc6fb8513761ff9026	2026-04-13 18:30:32.143	2026-04-13 18:30:32.143
oxY58aSAY57FKXpakQZW6C9Tbwc68pvn	d5KmHAy8Cm8tqYESO1yrjbCquuxPKsWd	credential	d5KmHAy8Cm8tqYESO1yrjbCquuxPKsWd	\N	\N	\N	\N	\N	\N	8d33deb5e7bf802246278f72b6b36df2:90bde8ff9f1882a30cc37476cc7bf47c03c5529b72aee7df662e1a1a694cfc6ee20150f8960ed549ae505b43e9f2cbb07eeb42510c1cc8927d64e9d9afa6d466	2026-04-16 10:52:23.33	2026-04-16 10:52:23.33
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId") FROM stdin;
h8otLbQY9v6KhgTQ5CRP4ZhCHvP544WG	2026-04-23 11:04:07.653	x8c7JDESg2C4LAN04fjUqax0WUwkoEWx	2026-04-16 11:04:07.654	2026-04-16 11:04:07.654	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	d5KmHAy8Cm8tqYESO1yrjbCquuxPKsWd
PIBRQXoRA7ENJtnw25u9jC7AJckXRUgb	2026-04-23 12:25:27.069	LQoWC8ukV4xMXed0phdfUv06247Wr328	2026-04-16 12:25:27.071	2026-04-16 12:25:27.071	10.250.127.209	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	cmnzn7pwi00003onrfsddsvr1
67gYf7COef2qhfhsixjEKHD1I7L6AP5M	2026-04-22 06:12:15.694	1f5mUmRe6OZYwmVSIXGmNrQuzop7P4FL	2026-04-15 06:12:15.695	2026-04-15 06:12:15.695	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	cmnzn7pwi00003onrfsddsvr1
xok5c8zkKsDH99JftRDSu1ztt9xLhLrJ	2026-04-22 09:22:25.703	dOfLZYAfDLVZ9kOj2JNnFDSc4rz6Dv9L	2026-04-15 09:22:25.713	2026-04-15 09:22:25.713	0000:0000:0000:0000:0000:0000:0000:0000	PostmanRuntime/7.53.0	cmnzn7pwi00003onrfsddsvr1
oht9EcmFQR25yBAdQ0XeMlrydWRGxgku	2026-04-23 10:52:23.35	BT5rq4WCIwTwxkwb4gxCtTHqVhSMEUJS	2026-04-16 10:52:23.351	2026-04-16 10:52:23.351	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	d5KmHAy8Cm8tqYESO1yrjbCquuxPKsWd
ZYfP9wQFtLsPEdbHEcVQ0W1ma5koK1WR	2026-04-23 12:36:12.299	RJvgQsDFiQWNafZYTbG9BgdIv9uy11rJ	2026-04-16 12:36:12.3	2026-04-16 12:36:12.3	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	cmnzn7pwi00003onrfsddsvr1
OzfH7kzfKlRerzYSxQsEJqA98SxqYsqE	2026-04-23 13:47:09.503	PYolydWRlLq3CC9z16womoag7J3s9V7m	2026-04-16 13:47:09.503	2026-04-16 13:47:09.504	10.250.127.6	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	cmnzn7pwi00003onrfsddsvr1
swyLFelKCr1KKLpdxPMYP4vFKaaNd6xS	2026-04-23 14:03:21.561	azbAlCaO0ls15rnbNRdwzSbc3W4DtD2m	2026-04-16 14:03:21.563	2026-04-16 14:03:21.563	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	cmnzn7pwi00003onrfsddsvr1
oGZBLLcSm4oUeJOpH0df3Dq0rwP0BExT	2026-04-23 14:04:38.701	4a77HASruuBPy5eHi2vblxQ3szZxirnD	2026-04-16 14:04:38.702	2026-04-16 14:04:38.702	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	cmnzn7pwi00003onrfsddsvr1
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."user" (id, name, username, email, role, "emailVerified", image, "createdAt", "updatedAt", "bakeryId") FROM stdin;
cmnzn7pwi00003onrfsddsvr1	Abdulaziz Nuri	abduanbuu	abdulaziznuri495@gmail.com	OWNER	f	\N	2026-04-13 18:30:32.1	2026-04-13 18:30:32.1	1
d5KmHAy8Cm8tqYESO1yrjbCquuxPKsWd	Sebhadin Redwan	sebred	sebhured@gmail.com	STAFF	f	\N	2026-04-16 10:52:23.261	2026-04-16 10:52:23.261	1
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: Bakery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Bakery_id_seq"', 1, true);


--
-- Name: Customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Customer_id_seq"', 7, true);


--
-- Name: Item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Item_id_seq"', 5, true);


--
-- Name: OrderItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."OrderItem_id_seq"', 12, true);


--
-- Name: Bakery Bakery_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Bakery"
    ADD CONSTRAINT "Bakery_pkey" PRIMARY KEY (id);


--
-- Name: Customer Customer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_pkey" PRIMARY KEY (id);


--
-- Name: Item Item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Item"
    ADD CONSTRAINT "Item_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: Bakery_ownerId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Bakery_ownerId_key" ON public."Bakery" USING btree ("ownerId");


--
-- Name: OrderItem_itemId_orderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "OrderItem_itemId_orderId_key" ON public."OrderItem" USING btree ("itemId", "orderId");


--
-- Name: account_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "account_userId_idx" ON public.account USING btree ("userId");


--
-- Name: session_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX session_token_key ON public.session USING btree (token);


--
-- Name: session_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "session_userId_idx" ON public.session USING btree ("userId");


--
-- Name: verification_identifier_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX verification_identifier_idx ON public.verification USING btree (identifier);


--
-- Name: Bakery Bakery_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Bakery"
    ADD CONSTRAINT "Bakery_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Customer Customer_bakeryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_bakeryId_fkey" FOREIGN KEY ("bakeryId") REFERENCES public."Bakery"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Customer Customer_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Item Item_bakeryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Item"
    ADD CONSTRAINT "Item_bakeryId_fkey" FOREIGN KEY ("bakeryId") REFERENCES public."Bakery"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Item Item_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Item"
    ADD CONSTRAINT "Item_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public."Item"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_bakeryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_bakeryId_fkey" FOREIGN KEY ("bakeryId") REFERENCES public."Bakery"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user user_bakeryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "user_bakeryId_fkey" FOREIGN KEY ("bakeryId") REFERENCES public."Bakery"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict 6yDCDQvneSUEaoFgoa5bclh3cZ5sKWxzbxntgI0eIjPoBObvlFp9HAQlWcNtZmL

