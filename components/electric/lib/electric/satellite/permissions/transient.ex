defmodule Electric.Satellite.Permissions.Transient do
  use GenServer

  alias Electric.Satellite.Permissions
  alias Electric.Postgres.Lsn

  defstruct [:id, :assign_id, :scope_id, :target_relation, :target_id, :valid_to]

  @type tid() :: :ets.tid()
  @type lut() :: atom() | tid()
  @type relation() :: Electric.Postgres.relation()
  @type t() :: %__MODULE__{
          id: binary(),
          assign_id: binary(),
          scope_id: binary(),
          target_relation: relation(),
          target_id: binary(),
          valid_to: Electric.Postgres.Lsn.t()
        }

  def new(attrs) do
    struct(__MODULE__, attrs)
  end

  @spec table_ref!(lut()) :: tid()
  def table_ref!(ref) when is_reference(ref) do
    ref
  end

  def table_ref!(name) when is_atom(name) do
    GenServer.call(name, :table_ref)
  end

  @spec for_roles([Permissions.Role.t()], lut()) :: [t()]
  def for_roles(roles, lsn, table \\ __MODULE__) do
    roles
    |> Stream.map(&filter_for_role/1)
    |> Stream.flat_map(&apply_filter(&1, table_ref!(table)))
    |> Enum.filter(&filter_expired(&1, lsn))
  end

  @spec update([t()], lut()) :: :ok
  def update(permissions, table \\ __MODULE__) do
    permissions
    |> Enum.map(&entry_for_permission/1)
    |> then(&:ets.insert(table_ref!(table), &1))

    :ok
  end

  defp entry_for_permission(%__MODULE__{} = permission) do
    %{assign_id: assign_id, scope_id: scope_id} = permission
    {assign_id, scope_id, permission}
  end

  defp filter_for_role(%Permissions.Role{assign_id: assign_id, scope: {_, scope_id}} = _role) do
    {assign_id, scope_id, :"$1"}
  end

  defp apply_filter(match, name) do
    name
    |> :ets.match(match)
    |> Stream.map(fn [m] -> m end)
  end

  defp filter_expired(%__MODULE__{valid_to: expires_lsn}, change_lsn) do
    Lsn.compare(expires_lsn, change_lsn) in [:gt, :eq]
  end

  def start_link(attrs \\ []) do
    name = Keyword.get(attrs, :name, __MODULE__)
    GenServer.start_link(__MODULE__, name, name: name)
  end

  @impl GenServer
  def init(name) do
    table = :ets.new(name, [:bag, :public, read_concurrency: true])
    # TODO: boot and load all existing transient permissions
    {:ok, table}
  end

  @impl GenServer
  def handle_call(:table_ref, _from, table) do
    {:reply, table, table}
  end
end
