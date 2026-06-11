import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

const fetchPosts = async () => {
  const res = await api.get("/posts");
  return res.data;
};

export const usePosts = () => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });
};
