"use client";

import { parseAsStringLiteral } from "nuqs";
import {
  DEFAULT_NEWS_PERIOD,
  newsPeriodValues,
} from "@/modules/news/news.constants";

export const newsPeriodParser = parseAsStringLiteral(newsPeriodValues)
  .withDefault(DEFAULT_NEWS_PERIOD)
  .withOptions({ history: "replace" });
