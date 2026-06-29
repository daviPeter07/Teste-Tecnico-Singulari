import type { PaginationMeta } from "@/modules/news/types/news.types";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";

type NewsPaginationProps = {
  currentPage: number;
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
};

function buildPaginationItems(currentPage: number, totalPages: number) {
  const pages = new Set<number>([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);

  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
}

export function NewsPagination({
  currentPage,
  meta,
  onPageChange,
}: NewsPaginationProps) {
  if (meta.totalPages <= 1) {
    return null;
  }

  const pages = buildPaginationItems(currentPage, meta.totalPages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#news-grid"
            onClick={(event) => {
              event.preventDefault();

              if (meta.hasPreviousPage) {
                onPageChange(currentPage - 1);
              }
            }}
            text="Anterior"
          />
        </PaginationItem>

        {pages.map((page, index) => {
          const previousPage = pages[index - 1];
          const shouldShowEllipsis = previousPage && page - previousPage > 1;

          return (
            <div className="contents" key={page}>
              {shouldShowEllipsis ? (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : null}

              <PaginationItem>
                <PaginationLink
                  href="#news-grid"
                  isActive={page === currentPage}
                  onClick={(event) => {
                    event.preventDefault();
                    onPageChange(page);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            </div>
          );
        })}

        <PaginationItem>
          <PaginationNext
            href="#news-grid"
            onClick={(event) => {
              event.preventDefault();

              if (meta.hasNextPage) {
                onPageChange(currentPage + 1);
              }
            }}
            text="Próxima"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
