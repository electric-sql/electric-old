---
title: Troubleshooting
description: >-
  Troubleshooting guide for deployment issues
sidebar_position: 60
---

&lt;Intro blurb&gt;

## IPv6

Depending on your database provider, you may need to take additional steps to configure the sync service with IPv6 connectivity. One example is the hosted Supabase Postgres which [dropped IPv4 support](https://supabase.com/docs/guides/platform/ipv4-address) for direct database connections on 26 January 2024. Note that it still offers IPv4 for pooled connections by Electric cannot use it, it must connect directly to the database.

...see [the draft in Slab](https://electric-sql.slab.com/posts/i-pv-6-troubleshooting-guide-4necoq66)...
