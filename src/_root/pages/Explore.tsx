import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import SearchResults from "@/components/shared/SearchResults";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { useGetPosts, useSearchPosts } from "@/lib/react-query/queryAndMutations";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

const Explore = () => {
  const { ref, inView } = useInView();
  const { data: posts, fetchNextPage, hasNextPage } = useGetPosts();

  const [searchValue, setSearchValue] = useState("");

  const debouncedValue = useDebounce(searchValue, 500);    // 500 milisaniye sonra arama islemi yapılır
  const { data: searchedPosts, isFetching: isSearchFetching } = useSearchPosts(debouncedValue);     // degere göre bir arama yapar ve bu sürecin ne zaman devam ettiğini, ne zaman tamamlandığını veya sonuçların ne zaman geldiğini izlemek icin 

  // sayfanın belirli bir kısmına geldiğinde ve bir arama değeri girilmediğinde bir sonraki sayfa verilerini getirmek için kullanılır
  useEffect(() => {
    if (inView && !searchValue) {
      fetchNextPage();
    }
  }, [inView, searchValue]);

  if (!posts)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  const shouldShowSearchResults = searchValue !== "";
  const shouldShowPosts = !shouldShowSearchResults &&
    posts?.pages.every((item) => item?.documents.length === 0);

  return (
    <div className="explore-container" >
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold w-full">Gönderi Ara</h2>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img
            src="/assets/icons/search.svg"
            width={24}
            height={24}
            alt="search"
          />
          <Input
            type="text"
            placeholder="Arama"
            className="explore-search"
            value={searchValue}
            onChange={(e) => {
              const { value } = e.target;
              setSearchValue(value);
            }}
          />
        </div>
      </div>

      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold">Gündemdekiler</h3>

        <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer">
          <p className="small-medium md:base-medium text-light-2">Hepsi</p>
          <img
            src="/assets/icons/filter.svg"
            width={20}
            height={20}
            alt="filter"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {shouldShowSearchResults ? (
          <SearchResults
            isSearchFetching={isSearchFetching}
            searchedPosts={searchedPosts}
          />
        ) : shouldShowPosts ? (
          <p className="text-light-4 mt-10 text-center w-full">Gönderinin son</p>
        ) :
          posts.pages.map((item, index) => (
            <GridPostList key={`page-${index}`} posts={item?.documents || []} />
          ))
        }
      </div>

      {hasNextPage && !searchValue && (
        <div ref={ref} className="mt-10">
          <Loader />
        </div>
      )}

    </div >
  )
}

export default Explore;