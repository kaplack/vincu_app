import { Routes } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { routes } from "@/routes";
import { loadSessionThunk } from "@/features/auth/slice/authSlice";
import { Toaster } from "sonner";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadSessionThunk());
  }, [dispatch]);

  return (
    <>
      <Routes>{routes}</Routes>
      <Toaster richColors position="top-right" />
    </>
  );
}
