import { http } from "./http";

export async function fetchPosts(params = {}) {
  const { data } = await http.get("/api/v1/posts", { params });
  return data;
}

export async function fetchPost(postId) {
  const { data } = await http.get(`/api/v1/posts/${postId}`);
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

export async function verifyPostPassword(postId, editPassword) {
  console.log("전송 시작, ID:", postId, "비번:", editPassword);
  try {
    const response = await http.post(`/api/v1/posts/${postId}/verify`, {
      edit_password: editPassword, // 백엔드 PostDelete 스키마와 일치해야 함
    });
    console.log("서버 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error("통신 에러 상세:", error.response?.data || error.message);
    throw error; // 에러를 호출한 곳(goToEdit)으로 던짐
  }
}
