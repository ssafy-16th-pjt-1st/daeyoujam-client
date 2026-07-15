import { http } from "./http";

export async function fetchPosts(params = {}) {
  const { data } = await http.get("/api/v1/posts", { params });
  return data;
}

export async function fetchPost(postId) {
  const { data } = await http.get(`/api/v1/posts/${postId}`);
  return data;
}

export async function fetchPostWithParams(postId, params = {}) {
  const { data } = await http.get(`/api/v1/posts/${postId}`, { params });
  return data;
}

export async function createPost(payload) {
  const { data } = await http.post("/api/v1/posts", payload);
  return data;
}

export async function fetchComments(postId) {
  const { data } = await http.get(`/api/v1/posts/${postId}/comments`);
  return data;
}

export async function createComment(postId, payload) {
  const { data } = await http.post(`/api/v1/posts/${postId}/comments`, payload);
  return data;
}

export async function deleteComment(postId, commentId, editPassword) {
  await http.delete(`/api/v1/posts/${postId}/comments/${commentId}`, {
    data: { edit_password: editPassword },
  });
}

export async function updatePost(postId, payload) {
  const { data } = await http.put(`/api/v1/posts/${postId}`, payload);
  return data;
}

export async function deletePost(postId, editPassword) {
  await http.delete(`/api/v1/posts/${postId}`, {
    data: { edit_password: editPassword },
  });
}

export async function togglePostLike(postId, guestId) {
  const { data } = await http.post(`/api/v1/posts/${postId}/likes`, { guest_id: guestId });
  return data;
}

export async function verifyPostPassword(postId, editPassword) {
  const { data } = await http.post(`/api/v1/posts/${postId}/verify`, {
    edit_password: editPassword,
  });
  return data;
}
