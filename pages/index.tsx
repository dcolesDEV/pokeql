import React from "react"
import { useQuery } from "@apollo/client"
import ErrorMessage from "@/components/ErrorMessage"
import Loading from "@/components/Loading"
import Wrapper from "@/components/Wrapper"
import { PokedexList, PokedexFilterMenu } from "@/components/pokedex"
import { GET_POKEMON_LIST } from "utils/queries"
import { DEFAULT_TYPES_COMPARISON, MAX_POKEMON_ID, PAGE_SIZE } from "@/utils/constants"
import Pager from "@/components/Pager"
import usePokedexFilterStore from "@/stores/filterStore"
import { getHeightFilter, getWeightFilter } from "@/utils/helpers"
import NoResults from "@/components/NoResults"
import { SearchFilter } from "@/components/pokedex/filters"

const Pokedex: React.FC = () => {
  const store = usePokedexFilterStore(state => state)

  const getTypesVariable = () => {
    const defaultValue = DEFAULT_TYPES_COMPARISON

    if (store.filters.types.length > 0) {
      const newValue = {
        _lte: DEFAULT_TYPES_COMPARISON._lte,
        _in: store.filters.types.map(x => x.value),
      }

      return newValue
    }

    return defaultValue
  }

  const getAbilityFilter = () => {
    if (!store.filters.ability?.value) return {}
    return { _eq: store.filters.ability?.value }
  }

  const { data, loading, error } = useQuery(GET_POKEMON_LIST, {
    variables: {
      maxPokemonId: MAX_POKEMON_ID,
      offset: (store.pageNumber - 1) * PAGE_SIZE,
      search: `%${store.search}%`,
      types: getTypesVariable(),
      height: getHeightFilter(store.filters.heights),
      weight: getWeightFilter(store.filters.weights),
      ability: getAbilityFilter(),
    },
  })

  return (
    <Wrapper page="Home">
      <div className="md:p-16">
        <div className="p-4">
          <p>Search</p>
          <SearchFilter initialSearch={store.search} updateSearch={store.updateSearch} />
        </div>
        <PokedexFilterMenu store={store} loading={loading} />
        {loading ? (
          <Loading />
        ) : error || !data ? (
          <ErrorMessage />
        ) : data.total.agg.count === 0 ? (
          <NoResults />
        ) : (
          <>
            <PokedexList data={data.pokemon} />
            <Pager
              totalItems={data.total.agg.count}
              currentPage={store.pageNumber}
              changePage={store.updatePageNumber}
            />
          </>
        )}
      </div>
    </Wrapper>
  )
}

export default Pokedex
