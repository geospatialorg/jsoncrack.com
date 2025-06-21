import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useMantineColorScheme } from "@mantine/core";
import "@mantine/dropzone/styles.css";
import styled, { ThemeProvider } from "styled-components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { NextSeo } from "next-seo";
import { SEO } from "../constants/seo";
import { darkTheme, lightTheme } from "../constants/theme";
import { FullscreenDropzone } from "../features/editor/FullscreenDropzone";
import ModalController from "../features/modals/ModalController";
import useConfig from "../store/useConfig";
import useFileStore from "../store/useFile";

// corect

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export const StyledPageWrapper = styled.div`
  height: calc(100vh - 27px);
  width: 100%;

  @media only screen and (max-width: 320px) {
    height: 100vh;
  }
`;

export const StyledEditorWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

export const StyledEditor = styled(Allotment)`
  position: relative !important;
  display: flex;
  background: ${({ theme }) => theme.BACKGROUND_SECONDARY};
  height: calc(100vh - 67px);

  @media only screen and (max-width: 320px) {
    height: 100vh;
  }
`;

const LiveEditor = dynamic(() => import("../features/editor/LiveEditor"), {
  ssr: false,
});

const EditorPage = () => {
  const router = useRouter();
  const isReady = router.isReady;
  const query = router.query;
  const { setColorScheme } = useMantineColorScheme();
  const checkEditorSession = useFileStore(state => state.checkEditorSession);
  const setFile = useFileStore.getState().setFile;
  const darkmodeEnabled = useConfig(state => state.darkmodeEnabled);

  useEffect(() => {
    if (isReady) {
      if (query?.json && typeof query.json === "string") {
        console.log("Am detectat URL JSON extern:", query.json);

        fetch(query.json)
          .then(res => res.json())
          .then(data => {
            const now = new Date().toISOString();
            const file = {
              id: "imported",
              name: "imported.json",
              content: JSON.stringify(data, null, 2),
              views: 0,
              owner_email: "local@jsoncrack.dev",
              private: false,
              created_at: now,
              updated_at: now,
            };
            setFile(file as any); // forțăm acceptarea structurii personalizate
          })
          .catch(error => {
            console.error("Eroare la încărcarea fișierului JSON din URL:", error);
          });
      } else {
        checkEditorSession(query?.json);
      }
    }
  }, [checkEditorSession, isReady, query, setFile]);

  useEffect(() => {
    setColorScheme(darkmodeEnabled ? "dark" : "light");
  }, [darkmodeEnabled, setColorScheme]);

  return (
    <>
      <NextSeo
        {...SEO}
        title="Editor | JSON Crack"
        description="JSON Crack Editor is a tool for visualizing into graphs, analyzing, editing, formatting, querying, transforming and validating JSON, CSV, YAML, XML, and more."
        canonical="https://jsoncrack.com/editor"
      />
      <ThemeProvider theme={darkmodeEnabled ? darkTheme : lightTheme}>
        <QueryClientProvider client={queryClient}>
          <ModalController />
          <StyledEditorWrapper>
            <StyledPageWrapper>
              <StyledEditorWrapper>
                <StyledEditor proportionalLayout={false}>
                  <Allotment.Pane minSize={0}>
                    <LiveEditor />
                  </Allotment.Pane>
                </StyledEditor>
                <FullscreenDropzone />
              </StyledEditorWrapper>
            </StyledPageWrapper>
          </StyledEditorWrapper>
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
};

export default EditorPage;
