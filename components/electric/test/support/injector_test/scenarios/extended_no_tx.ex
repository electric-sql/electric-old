defmodule Electric.Postgres.Proxy.TestScenario.ExtendedNoTx do
  @moduledoc """
  Statements are issued using the extended protocol, but no explicit
  transactions are used.
  """
  use Electric.Postgres.Proxy.TestScenario

  def tags do
    [scenario: :extended_no_tx, protocol: :extended, framework: false, tx: false, version: false]
  end

  def description do
    "Extended: [extended, no-tx, no-version]"
  end

  def tx?, do: false

  def assert_non_electrified_migration(injector, _framework, query) do
    tag = random_tag()

    injector
    |> electric_begin(client: parse_describe(query))
    |> server(parse_describe_complete())
    |> client(bind_execute())
    |> server(bind_execute_complete(tag), server: commit())
    |> server(complete_ready("COMMIT", :idle), client: [bind_execute_complete(tag, :idle)])
    |> idle!()
  end

  def assert_injector_passthrough(injector, _framework, query) do
    tag = random_tag()

    injector
    |> client(parse_describe(query))
    |> server(parse_describe_complete())
    |> client(bind_execute())
    |> server(bind_execute_complete(tag, :idle))
    |> idle!()
  end

  def assert_electrified_migration(injector, _framework, query, rules \\ default_rules()) do
    {query, opts} =
      case query do
        sql when is_binary(sql) ->
          {sql, []}

        [sql] when is_binary(sql) ->
          {sql, []}

        {sql, opts} when is_binary(sql) ->
          {sql, opts}

        [_ | _] ->
          raise ArgumentError,
            message: "Extended-no-tx migration does not support multiple queries"
      end

    tag = random_tag()

    injector
    |> electric_begin([client: parse_describe(query)], rules: rules)
    |> server(parse_describe_complete())
    |> client(bind_execute())
    |> server(
      bind_execute_complete(tag),
      server: capture_ddl_query(query),
      client: capture_notice(query)
    )
    |> shadow_add_column(capture_ddl_complete(), opts, server: capture_version_query())
    |> electric_commit([server: capture_version_complete()],
      client: [bind_execute_complete(tag, :idle)]
    )
    |> idle!()
  end

  def assert_injector_error(injector, query, error_details) do
    injector
    |> client(parse_describe(query), client: [error(error_details), ready(:failed)])
    |> idle!()
  end

  def assert_valid_electric_command(injector, _framework, query, opts \\ []) do
    {:ok, command} = DDLX.parse(query)

    # may not be used but needs to be valid sql
    ddl = Keyword.get(opts, :ddl, "CREATE TABLE _not_used_ (id uuid PRIMARY KEY)")

    if modifies_permissions?(command) do
      injector
      |> electric_begin([client: parse_describe(query)], client: parse_describe_complete())
      |> electric([client: bind_execute()], command, ddl, fn injector ->
        rules = permissions_modified!(injector)
        [server: save_permissions_rules_query(rules)]
      end)
      |> server(complete_ready(), server: capture_version_query())
      |> electric_commit([server: capture_version_complete()],
        client: [bind_execute_complete(DDLX.Command.tag(command), :idle)]
      )
      |> idle!()
    else
      injector
      |> electric_begin([client: parse_describe(query)], client: parse_describe_complete())
      |> electric([client: bind_execute()], command, ddl, server: capture_version_query())
      |> electric_commit([server: capture_version_complete()],
        client: [bind_execute_complete(DDLX.Command.tag(command), :idle)]
      )
      |> idle!()
    end
  end

  def assert_electrify_server_error(injector, _framework, query, ddl, error_details) do
    # assert that the electrify command only generates a single query
    {:ok, command} = DDLX.parse(query)

    [electrify | _rest] =
      command
      |> proxy_sql(ddl)
      |> Enum.map(&query/1)

    injector
    |> electric_begin([client: parse_describe(query)], client: parse_describe_complete())
    |> electric_preamble([client: bind_execute()], command)
    |> server(introspect_result(ddl), server: electrify)
    |> server([error(error_details), ready(:failed)], server: rollback())
    |> server(complete_ready("ROLLBACK", :idle), client: [error(error_details), ready(:failed)])
    |> idle!()
  end
end
