"use client";

import { useEffect } from "react";
import { useGetSEOByPage } from "@/lib/api";

export default function MetaTags({ page }: { page: string }) {
  const { data: seo } = useGetSEOByPage(page);

  useEffect(() => {
    if (!seo) return;

    const setTitle = (val: string | null) => {
      if (val) document.title = val;
    };
    const setMeta = (name: string, val: string | null) => {
      if (!val) return;
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", val);
    };
    const setProperty = (prop: string, val: string | null) => {
      if (!val) return;
      let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", prop);
        document.head.appendChild(el);
      }
      el.setAttribute("content", val);
    };

    setTitle(seo.metaTitle);
    setMeta("description", seo.metaDescription);
    setMeta("keywords", seo.metaKeywords);
    setMeta("robots", seo.robotsMeta);
    setProperty("og:title", seo.ogTitle ?? seo.metaTitle);
    setProperty("og:description", seo.ogDescription ?? seo.metaDescription);
    setProperty("og:image", seo.ogImage);

    if (seo.canonicalUrl) {
      let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = seo.canonicalUrl;
    }
  }, [seo]);

  return null;
}
