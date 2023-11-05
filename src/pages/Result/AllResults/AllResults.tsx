import { useEffect, useState } from "react";
import cl from "./AllResults.module.css";
import Search from "../../../components/Search/Search";
import ProfileItem from "../../../components/ProfileItem/ProfileItem";
import PostCard from "../../../components/PostCard/PostCard";
import NDK, { NDKEvent } from "@nostrband/ndk";
import { Link, useSearchParams } from "react-router-dom";
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton";
import { useAppSelector } from "../../../hooks/redux";
import { nip19 } from "@nostrband/nostr-tools";

const AllResults = () => {
  const ndk = useAppSelector((store) => store.connectionReducer.ndk);
  const [searchParams] = useSearchParams();
  const [profiles, setProfiles] = useState<NDKEvent[]>([]);
  const [profilesCount, setProfilesCount] = useState<number>(0);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState<boolean>(false);
  const [posts, setPosts] = useState<NDKEvent[]>([]);
  const [postsAuthors, setPostsAuthors] = useState<NDKEvent[]>([]);
  const [postsCount, setPostsCount] = useState(0);

  useEffect(() => {
    if (ndk instanceof NDK) {
      getProfiles(ndk);
      getPosts(ndk);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("q")]);

  const getProfiles = async (ndk: NDK) => {
    if (ndk instanceof NDK) {
      const search = searchParams.get("q");
      const tagsWithHash = search
        ?.split(" ")
        .filter((s) => s.match(/#[a-zA-Z0-9_]+/g)?.toString());
      const tags = tagsWithHash?.map((tag) => tag.replace("#", ""));
      search?.replace(/#[a-zA-Z0-9_]+/g, "");
      const cleanSearch = searchParams
        .get("q")
        ?.split(" ")
        .filter((str) => !str.match(/following:npub[0-9a-zA-Z]+/g))
        .join(" ")
        .replace(/#[a-zA-Z0-9_]+/g, "");
      setIsLoadingProfiles(true);
      if (search?.includes("following:")) {
        const userNpub = search?.match(/npub[0-9a-zA-Z]+/g)![0];
        const userPk = userNpub ? nip19.decode(userNpub).data : "";

        //@ts-ignore
        const userContacts = await ndk.fetchEvent({
          kinds: [3],
          authors: [userPk],
        });
        const followingPubkeys = userContacts
          ? userContacts?.tags.slice(0, 500).map((contact) => contact[1])
          : [];

        const topProfilesFilter = {
          kinds: [0],
          authors: followingPubkeys,
          limit: 3,
        };
        if (cleanSearch) {
          Object.defineProperty(topProfilesFilter, "search", {
            value: cleanSearch.trimStart().trimEnd(),
            enumerable: true,
          });
        }

        if (tags?.length) {
          Object.defineProperty(topProfilesFilter, "t", {
            value: tags,
            enumerable: true,
          });
        }

        console.log("profilesFilter", topProfilesFilter);

        const topProfilesIds = await ndk.fetchTop(topProfilesFilter);
        const topProfiles = Array.from(
          //@ts-ignore
          await ndk.fetchEvents({ kinds: [0], ids: topProfilesIds.ids })
        );
        setProfiles(topProfiles);
        setProfilesCount(
          userContacts?.tags?.length ? userContacts?.tags?.length : 0
        );
      } else if (search?.includes("by:")) {
        const userNpub = search?.match(/npub[0-9a-zA-Z]+/g)![0];
        const userPk = userNpub ? nip19.decode(userNpub).data : "";
        //@ts-ignore
        const user = await ndk.fetchEvent({ kinds: [0], authors: [userPk] });
        setProfiles(user ? [user] : []);

        setProfilesCount(1);
      } else {
        const search = searchParams
          .get("q")
          ?.toString()
          .replace(/#[a-zA-Z0-9_]+/g, "");
        const filter = {
          kinds: [0],
          limit: 3,
        };

        if (search?.trim()) {
          Object.defineProperty(filter, "search", {
            value: search.trimStart().trimEnd(),
            enumerable: true,
          });
        }

        if (tags?.length) {
          Object.defineProperty(filter, "#t", {
            value: tags,
            enumerable: true,
          });
        }

        console.log("profilesFilter", filter);

        //@ts-ignore
        const topProfilesIds = await ndk.fetchTop(filter);

        const topProfiles = topProfilesIds
          ? Array.from(
              //@ts-ignore
              await ndk.fetchEvents({ kinds: [0], ids: topProfilesIds.ids })
            )
          : [];
        setProfiles(topProfiles);
        const countFilter = {
          kinds: [0],
          //@ts-ignore
        };
        if (search?.trim()) {
          Object.defineProperty(countFilter, "search", {
            value: search.trimStart().trimEnd(),
            enumerable: true,
          });
        }

        if (tags?.length) {
          Object.defineProperty(countFilter, "#t", {
            value: tags,
            enumerable: true,
          });
        }
        const profilesCount = await ndk.fetchCount(countFilter);
        setProfilesCount(profilesCount?.count ? profilesCount.count : 0);
      }
      setIsLoadingProfiles(false);
    }
  };

  const getPosts = async (ndk: NDK) => {
    try {
      if (ndk instanceof NDK) {
        const search = searchParams.get("q");
        const tagsWithHash = search
          ?.split(" ")
          .filter((s) => s.match(/#[a-zA-Z0-9_]+/g)?.toString());
        const tags = tagsWithHash?.map((tag) => tag.replace("#", ""));
        search?.replace(/#[a-zA-Z0-9_]+/g, "");

        if (search?.includes("following:")) {
          const userNpub = search?.match(/npub[0-9a-zA-Z]+/g)![0];
          const userPk = userNpub ? nip19.decode(userNpub).data : "";
          const cleanSearch = searchParams
            .get("q")
            ?.split(" ")
            .filter((str) => !str.match(/following:npub[0-9a-zA-Z]+/g))
            .join(" ")
            .replace(/#[a-zA-Z0-9_]+/g, "");

          //@ts-ignore
          const userContacts = await ndk.fetchEvent({
            kinds: [3],
            authors: [userPk],
          });
          const followingPubkeys = userContacts
            ? userContacts?.tags.slice(0, 500).map((contact) => contact[1])
            : [];

          const postsFilter = {
            kinds: [1],
            authors: followingPubkeys,
            limit: 10,
          };

          if (cleanSearch?.trim()) {
            Object.defineProperty(postsFilter, "search", {
              value: cleanSearch.trimStart().trimEnd(),
              enumerable: true,
            });
          }

          if (tags?.length) {
            Object.defineProperty(postsFilter, "#t", {
              value: tags,
              enumerable: true,
            });
          }

          console.log("postsFilter", postsFilter);

          const posts = Array.from(await ndk.fetchEvents(postsFilter));

          const postsCount = await ndk.fetchCount(postsFilter);
          setPostsCount(postsCount?.count ? postsCount.count : 0);

          const postsAuthorsPks = posts.map((post) => post.pubkey);
          const postsAuthors = Array.from(
            await ndk.fetchEvents({
              kinds: [0],
              authors: postsAuthorsPks,
              limit: 10,
            })
          );
          setPosts(posts);
          setPostsAuthors(postsAuthors);
        } else if (search?.includes("by:")) {
          const userNpub = search?.match(/npub[0-9a-zA-Z]+/g)![0];
          const userPk = userNpub ? nip19.decode(userNpub).data.toString() : "";
          const cleanSearch = searchParams
            .get("q")
            ?.split(" ")
            .filter((str) => !str.match(/by:npub[0-9a-zA-Z]+/g))
            .join(" ")
            .replace(/#[a-zA-Z0-9_]+/g, "");

          const postsFilter = { kinds: [1], authors: [userPk], limit: 10 };

          if (cleanSearch?.trim()) {
            Object.defineProperty(postsFilter, "search", {
              value: cleanSearch.trimStart().trimEnd(),
              enumerable: true,
            });
          }

          if (tags?.length) {
            Object.defineProperty(postsFilter, "#t", {
              value: tags,
              enumerable: true,
            });
          }

          console.log("postsFilter", postsFilter);

          const posts = Array.from(await ndk.fetchEvents(postsFilter));

          const postsCount = await ndk.fetchCount(postsFilter);
          setPostsCount(postsCount?.count ? postsCount.count : 0);

          const postsAuthorsPks = posts.map((post) => post.pubkey);
          const postsAuthors = Array.from(
            await ndk.fetchEvents({
              kinds: [0],
              authors: postsAuthorsPks,
              limit: 10,
            })
          );
          setPosts(posts);
          setPostsAuthors(postsAuthors);
        } else {
          const cleanSearch = search?.replace(/#[a-zA-Z0-9_]+/g, "");
          const postsFilter = {
            kinds: [1],
            //@ts-ignore
            limit: 10,
          };

          if (cleanSearch?.trim()) {
            Object.defineProperty(postsFilter, "search", {
              value: cleanSearch.trimStart().trimEnd(),
              enumerable: true,
            });
          }

          if (tags?.length) {
            Object.defineProperty(postsFilter, "#t", {
              value: tags,
              enumerable: true,
            });
          }
          console.log("postsFilter", postsFilter);

          const posts = Array.from(
            //@ts-ignore
            await ndk.fetchEvents(postsFilter)
          );
          const postsAuthorsPks = posts.map((post) => post.pubkey);
          const postsAuthors = Array.from(
            await ndk.fetchEvents({ kinds: [0], authors: postsAuthorsPks })
          );
          setPosts(posts);
          setPostsAuthors(postsAuthors);
          const postsCount = await ndk.fetchCount({
            kinds: [1],
            //@ts-ignore
            search: search,
          });
          setPostsCount(postsCount?.count ? postsCount.count : 0);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className={cl.result}>
      <Search isLoading={isLoadingProfiles} />
      {!isLoadingProfiles ? (
        profiles?.length ? (
          <div className={cl.resultProfiles}>
            <h2>Profiles</h2>
            {profiles.map((profile) => {
              const profileContent = JSON.parse(profile.content);
              return (
                <ProfileItem
                  img={profileContent.picture}
                  pubKey={profile.pubkey}
                  bio={profileContent.about}
                  name={
                    profileContent.display_name
                      ? profileContent.display_name
                      : profileContent.name
                  }
                  key={profile.id}
                  mail={profileContent.nip05}
                  newFollowersCount={0}
                />
              );
            })}
          </div>
        ) : (
          "No profiles"
        )
      ) : (
        <CardSkeleton cards={3} />
      )}
      {profilesCount >= 4 && (
        <Link
          className={cl.moreLink}
          to={`/?q=${searchParams.get("q")}&type=profiles`}
        >
          And {profilesCount ? profilesCount : 0} more profiles →
        </Link>
      )}
      {posts?.length ? (
        <div className={cl.resPosts}>
          <h2>Results</h2>
          {posts.map((post) => {
            const postAuthor = postsAuthors.find(
              (author) => author.pubkey === post.pubkey
            );
            const authorContent = postAuthor
              ? JSON.parse(postAuthor.content)
              : {};

            return (
              <PostCard
                key={post.id}
                name={
                  authorContent.display_name
                    ? authorContent.display_name
                    : authorContent.name
                }
                picture={authorContent.picture}
                about={post.content}
                pubkey={post.pubkey}
                eventId={post.id}
                createdDate={post.created_at ? post.created_at : 0}
                thread={""}
              />
            );
          })}
        </div>
      ) : (
        ""
      )}
      {postsCount >= 10 && (
        <Link
          className={cl.moreLink}
          to={`/?q=${searchParams.get("q")}&type=posts`}
        >
          And {postsCount ? postsCount : 0} more posts →
        </Link>
      )}
    </div>
  );
};

export default AllResults;
