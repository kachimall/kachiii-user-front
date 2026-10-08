import type { Metadata } from "next";
import { FileTextIcon } from "lucide-react";
import { Markdown } from "@/components/content/markdown";
import { EmptyState } from "@/components/ui/empty-state";
import { getShopPage, shopPages, type ShopPageKey } from "@/lib/api/catalog";

// The static pages staff write in the admin portal (terms, privacy, returns, contact).
// Each lives at its key, which is also the address the backend's sitemap gives it.

export async function shopPageMetadata(key: ShopPageKey): Promise<Metadata> {
  const page = await getShopPage(key).catch(() => undefined);
  return { title: page?.title ?? shopPages[key] };
}

export async function ShopPage({ pageKey }: { pageKey: ShopPageKey }) {
  // Pages are built ahead and refreshed every few minutes; a backend outage at build time
  // leaves the placeholder until the next refresh rather than failing the build.
  const page = await getShopPage(pageKey).catch(() => undefined);

  return (
    <div className="mx-auto max-w-3xl px-3 pt-3 pb-10 md:px-6 md:pt-6">
      {page ? (
        <article className="rounded-lg bg-surface-container-lowest p-5 shadow-card md:p-8">
          <header className="mb-5 border-b border-surface-container pb-4">
            <h1 className="font-heading text-headline-lg-mobile md:text-headline-lg">{page.title}</h1>
            {page.updated_at && (
              <p className="mt-1 text-body-sm text-on-surface-variant">
                Last updated{" "}
                <time dateTime={page.updated_at}>
                  {new Date(page.updated_at).toLocaleDateString("en-AE", { dateStyle: "long" })}
                </time>
              </p>
            )}
          </header>
          <Markdown source={page.body} />
        </article>
      ) : (
        <EmptyState
          icon={FileTextIcon}
          title={shopPages[pageKey]}
          description="This page is being written. Check back soon."
        />
      )}
    </div>
  );
}
