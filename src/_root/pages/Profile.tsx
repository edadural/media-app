import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import { Link, Outlet, Route, Routes, useLocation, useParams } from "react-router-dom";
import { LikedPosts } from ".";
import { useGetUserById } from "@/lib/react-query/queryAndMutations";

interface StabBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StabBlockProps) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);

const Profile = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const { pathname } = useLocation();

  const { data: currentUser } = useGetUserById(id || "");

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <img
            src={
              currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"
            }
            alt="profile"
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full"
          />
          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
                {currentUser.name}
              </h1>
              <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                @{currentUser.username}
              </p>
            </div>

            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
              <StatBlock value={currentUser.posts.length} label="Gönderi" />
            </div>

            <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
              {currentUser.bio}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            {/* mevcut kullanıcının kimliği (user.id) ve profil sayfasında görüntülenen kullanıcının kimliği (currentUser.$id) aynı değilse, hidden eklenir */}
            {/*  mevcut kullanıcı başka bir kullanıcının profiline bakıyorsa, "Profili Düzenle" butonu gibi bazı öğeleri gizlemek için kullanılır */}
            <div className={`${user.id !== currentUser.$id && "hidden"}`}>
              <Link
                to={`/update-profile/${currentUser.$id}`}
                className={`h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg ${user.id !== currentUser.$id && "hidden"
                  }`}>
                <img
                  src={"/assets/icons/edit.svg"}
                  alt="edit"
                  width={20}
                  height={20}
                />
                <p className="flex whitespace-nowrap small-medium">
                  Profili Düzenle
                </p>
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* görüntülenen profil mevcut kullanıcının kendi profiliyse, begenileri ve gonderileri gösterir. */}
      {currentUser.$id === user.id && (
        <div className="flex max-w-5xl w-full">
          <Link
            to={`/profile/${id}`}
            className={`profile-tab rounded-l-lg ${pathname === `/profile/${id}` && "!bg-dark-3"
              }`}>
            <img
              src={"/assets/icons/posts.svg"}
              alt="posts"
              width={20}
              height={20}
            />
            Gönderiler
          </Link>
          <Link
            to={`/profile/${id}/liked-posts`}
            className={`profile-tab rounded-r-lg ${pathname === `/profile/${id}/liked-posts` && "!bg-dark-3"
              }`}>
            <img
              src={"/assets/icons/like.svg"}
              alt="like"
              width={20}
              height={20}
            />
            Beğenilenler
          </Link>
        </div>
      )}


      {/* belirli rotalara göre içerikleri görüntülemek için yapılandırma */}
      <Routes>
        {/* Kullanıcı profili sahibinin gönderilerini gösterir  */}
        <Route
          index
          element={<GridPostList posts={currentUser.posts} showUser={false} />}
        />
        {/* Eğer kullanıcı kendi profilindeyse */}
        {currentUser.$id === user.id && (
          //  "Beğenilenler" içeriğini gösterir 
          <Route path="/liked-posts" element={<LikedPosts />} />
        )}
      </Routes>
      {/* rotaların içinde başka rotaları göstermek */}
      <Outlet />      {/* Route içindeki bileşenlerin görüntülenmesini sağlar*/}
    </div>
  );
};

export default Profile;