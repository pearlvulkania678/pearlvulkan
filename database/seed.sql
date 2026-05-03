--
-- PostgreSQL database dump
--


-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: activity_log; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (1, 'UPDATE', 'poem', 1, 'Manifest', '2026-05-02 20:36:06.723731+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (2, 'UPDATE', 'poem', 1, 'Manifest', '2026-05-02 20:36:19.29106+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (3, 'CREATE', 'poem', 4, 'new', '2026-05-02 20:37:03.868537+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (4, 'UPDATE', 'poem', 4, 'new', '2026-05-02 20:40:09.873566+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (5, 'UPDATE', 'poem', 4, 'new', '2026-05-02 20:43:08.134005+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (6, 'UPDATE', 'poem', 4, 'new', '2026-05-02 20:43:46.662669+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (7, 'UPDATE', 'track', 6, 'Waves', '2026-05-02 20:45:17.702901+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (8, 'UPDATE', 'poem', 1, 'Manifest', '2026-05-02 20:45:56.171814+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (9, 'DELETE', 'poem', 3, NULL, '2026-05-02 21:09:46.320743+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (10, 'CREATE', 'touch', 1, '2gdf', '2026-05-02 21:16:48.65223+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (11, 'UPDATE', 'touch', 1, '2gdf', '2026-05-02 21:17:01.220052+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (12, 'UPDATE', 'touch', 1, '2gdf', '2026-05-02 21:17:30.05394+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (13, 'CREATE', 'sense', 1, '5.jkbkjh', '2026-05-02 21:18:05.889434+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (14, 'UPDATE', 'sense', 1, '5.jkbkjh', '2026-05-02 21:18:11.641436+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (15, 'UPDATE', 'touch', 1, '2gdf', '2026-05-02 21:34:49.555347+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (16, 'UPDATE', 'sense', 1, '5.jkbkjh', '2026-05-02 21:49:39.903135+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (17, 'CREATE', 'track', 7, 'Fields', '2026-05-02 22:13:04.929457+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (18, 'UPDATE', 'track', 7, 'Fields', '2026-05-02 22:16:21.255782+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (19, 'UPDATE', 'track', 7, 'Fields', '2026-05-02 22:17:28.005884+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (52, 'UPDATE', 'poem', 4, 'new', '2026-05-02 23:42:50.841853+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (53, 'UPDATE', 'poem', 1, 'Manifest', '2026-05-02 23:47:39.700763+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (54, 'UPDATE', 'poem', 4, 'new', '2026-05-02 23:48:39.437031+00');
INSERT INTO public.activity_log (id, action, entity, entity_id, entity_title, created_at) VALUES (55, 'UPDATE', 'poem', 1, 'Manifest', '2026-05-02 23:48:49.649519+00');


--
-- Data for Name: gallery; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: poems; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.poems (id, title, content, tags, sort_order, created_at, updated_at, published) VALUES (4, 'new', '[{"type":"text","value":"here is video"},{"type":"video","src":"https://www.youtube.com/watch?v=eodsaoMW2AU","caption":""},{"type":"text","value":"here is more"},{"type":"audio","src":"/uploads/2e27c2c1915147e0dbaebe31.mp3"},{"type":"video","src":"https://www.youtube.com/watch?v=NFIjapk9vVk","caption":""}]', '{POETRY,UKRAINIAN,VULCANSALUT}', 0, '2026-05-02 20:37:03.862975+00', '2026-05-02 23:48:39.423+00', true);
INSERT INTO public.poems (id, title, content, tags, sort_order, created_at, updated_at, published) VALUES (1, 'Manifest', '[{"type":"image","src":"/uploads/2d488b4174fe59e4e2d87da7.png","caption":""},{"type":"audio","src":"/uploads/4116bbf9ec561051cde11c5a.mp3"},{"type":"text","value":"А ж поки з моє і з моє ю не ди ліз є\nфлоре атрига\n\n\n\n5 аутро\n\nДав дати с''ности в цей світ красу\n\nБо вже не можу\n\nВинести ті б''є кис а у рожу"},{"type":"image","src":"/uploads/21905075011b18fc68e71940.png","caption":""}]', '{POETRY,UKRAINIAN,VULCANSALUT}', 0, '2026-05-02 16:26:16.709242+00', '2026-05-02 23:48:49.611+00', true);


--
-- Data for Name: sense_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.sense_items (id, title, date, location, description, image_path, link_url, published, sort_order, created_at, updated_at, content) VALUES (1, '5.jkbkjh', NULL, NULL, 'kjgljhlkn', NULL, NULL, true, 0, '2026-05-02 21:18:05.840052+00', '2026-05-02 21:49:39.807+00', '[{"type":"video","src":"https://www.youtube.com/watch?v=ngamb4mU0iI","caption":""}]');


--
-- Data for Name: social_links; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.social_links (id, label, url, sort_order, published, created_at) VALUES (1, 'Youtube', 'https://www.youtube.com/watch?v=ngamb4mU0iI', 0, true, '2026-05-02 21:54:22.492449+00');
INSERT INTO public.social_links (id, label, url, sort_order, published, created_at) VALUES (3, 'Contact', 'mailto:contact@pearlvulkan.com', 0, true, '2026-05-02 22:41:33.698908+00');


--
-- Data for Name: start_settings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.start_settings (id, artist_name, quote, tagline, background_image, updated_at, bg_opacity) VALUES (1, 'Pearl Vulkan', 'as in volcano with pearls', 'Enter. ', '/uploads/732f87efd8039623f52d86fa.png', '2026-05-02 23:09:43.862+00', 96);


--
-- Data for Name: touch_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.touch_items (id, title, subtitle, description, image_path, link_url, published, sort_order, created_at, updated_at, content) VALUES (1, '2gdf', NULL, 'dbdb', '/uploads/77099581842c53a0e1966833.png', NULL, true, 0, '2026-05-02 21:16:48.517103+00', '2026-05-02 21:34:49.291+00', '[{"type":"video","src":"https://www.youtube.com/watch?v=ngamb4mU0iI","caption":""}]');


--
-- Data for Name: tracks; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tracks (id, title, genre, duration, description, image_path, has_listen, sort_order, created_at, updated_at, published, audio_path, soundcloud_url) VALUES (2, 'Sun Shining Bright Over Ellada', 'AMBIENT', '4:00', 'A track', NULL, true, 0, '2026-05-02 16:26:16.709242+00', '2026-05-02 20:11:18.91+00', true, NULL, 'https://soundcloud.com/user-484848121/sun-shining-bright-over-ellada');
INSERT INTO public.tracks (id, title, genre, duration, description, image_path, has_listen, sort_order, created_at, updated_at, published, audio_path, soundcloud_url) VALUES (3, 'Nebel des Krieges', 'AMBIENT', '5:00', 'A track', NULL, true, 2, '2026-05-02 16:26:16.709242+00', '2026-05-02 20:13:25.333+00', true, NULL, 'https://soundcloud.com/user-484848121/nebel-des-krieges');
INSERT INTO public.tracks (id, title, genre, duration, description, image_path, has_listen, sort_order, created_at, updated_at, published, audio_path, soundcloud_url) VALUES (6, 'Waves', '', '2:40', 'we run?', NULL, false, 1, '2026-05-02 19:56:01.564104+00', '2026-05-02 20:45:17.673+00', true, '/uploads/53151de555311f99b7828c12.mp3', NULL);
INSERT INTO public.tracks (id, title, genre, duration, description, image_path, has_listen, sort_order, created_at, updated_at, published, audio_path, soundcloud_url) VALUES (7, 'Fields', 'EXPERIMENTAL', '5:55', '2020, колаборація з 2 воронами і приблизно 5-20 стрижів

in collaboration with 2 crows&approximately 5 to 20 swifts
written&recorded in 2020', 'https://i1.sndcdn.com/artworks-CbvWbAJDEJYuLpYv-w9AWWw-t500x500.jpg', false, 0, '2026-05-02 22:13:04.690763+00', '2026-05-02 22:17:28+00', true, NULL, 'https://soundcloud.com/user-792595730/fields');


--
-- Name: activity_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_log_id_seq', 55, true);


--
-- Name: gallery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.gallery_id_seq', 3, true);


--
-- Name: poems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.poems_id_seq', 4, true);


--
-- Name: sense_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sense_items_id_seq', 1, true);


--
-- Name: social_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.social_links_id_seq', 3, true);


--
-- Name: touch_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.touch_items_id_seq', 1, true);


--
-- Name: tracks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tracks_id_seq', 7, true);


--
-- PostgreSQL database dump complete
--

\unrestrict P9x8N6elW3FbyljYxpRhhpu8O1PVnfl6YN8zjqjZfUS4usmg3HOBt8j3VAHGeIq

