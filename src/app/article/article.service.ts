import { Injectable } from '@angular/core';

import { ArticleApiService } from './article.api.service';
import { IArticleElement } from './articleElement.interface';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  constructor(public articleApiService: ArticleApiService) {}

  getArticleElementList(data): IArticleElement[] {
    const articleElementArray = [];
    data.forEach((articleElement) => {
      articleElementArray.push(this.createArticleElement(articleElement));
    });
    return articleElementArray;
  }

  createArticleElement(articleElement): IArticleElement {
    const articleTags = [];
    articleElement.articleTagMap.forEach((element) => {
      const tag_name = this.getArticleTagName(element.tagId);
      articleTags.push(tag_name.tag_name);
    });

    const thisArticleElement = {
              id: articleElement.artId,
              art_title: articleElement.title,
              art_desc: articleElement.summary,
              art_author: articleElement.profile.author,
              art_date: articleElement.date,
              art_tags: articleTags
            } as IArticleElement;
    return thisArticleElement;
    }

  getArticleTagName(art_tag_id: number) {
    const art_map = this.articleApiService.getArticleTagMap();
    return art_map.tag_map[art_tag_id];
  }

  getArticleId(art_tag_name: string) {
    if (art_tag_name) {
      const art_map = this.articleApiService.getArticleTagMap();
      const art_key = Object.keys(art_map.tag_map);

      for (let i = 0; i <= art_key.length - 1; i++) {
        const iteration_tag_name = art_map.tag_map[art_key[i]].tag_name;
        if (iteration_tag_name.toLowerCase() === art_tag_name) {
          return art_key[i];
        }
      }
    }
    return -1;
  }
}
