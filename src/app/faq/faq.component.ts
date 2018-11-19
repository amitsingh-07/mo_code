import { Component, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { FooterService } from '../shared/footer/footer.service';
import { NavbarService } from '../shared/navbar/navbar.service';

import { IFAQSection } from './faq.interface';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FAQComponent implements OnInit {
  public pageTitle: string;
  public sections: any;
  constructor(private navbarService: NavbarService, private footerService: FooterService,
              public translate: TranslateService, public renderer: Renderer2) {
                this.translate.use('en');
                this.translate.get('COMMON').subscribe((result: string) => {
                  this.pageTitle = this.translate.instant('FAQ.TITLE');
                  this.sections = this.getFAQSections(this.translate.instant('FAQ.CONTENT'));
                });
              }

  ngOnInit() {
  }

  toggleActive(event: any) {
    event.preventDefault();
    const targetEle = event.target.classList.contains('active');
    if (targetEle) {
      this.renderer.removeClass(event.srcElement, 'active');
    } else {
      this.renderer.addClass(event.srcElement, 'active');
    }
  }

  getFAQSections(data: any): IFAQSection[] {
    const sections = [];
    const groupKey = Object.keys(data);
    groupKey.forEach((element) => {
      sections.push(this.createFAQSections(element, data[element]));
    });
    return sections;
  }

  createFAQSections(section_title: string, section_data: any): IFAQSection {
    const section_groups = Object.keys(section_data);
    const section_question_sets = [];

    section_groups.forEach((group) => {
      section_question_sets.push(section_data[group]);
    });
    const section = {
      title: section_title,
      groups: section_groups,
      questions: section_question_sets
    } as IFAQSection;
    return section;
  }

  toggleSection(event: any) {
    event.preventDefault();
    const targetEle = event.target.classList.contains('active');
    if (!targetEle) {
      const parent = event.srcElement.parentNode;
      const children = parent.childNodes;
      const button = parent.parentNode.childNodes[0];
      const sectionParent = parent.parentNode.parentNode;
      const sectionChildren = sectionParent.childNodes;
      // Deactivating
      for (let i = 1; i < children.length; i++) {
          const selected = children[i];
          if (selected.classList.contains('active')) {
            const active_section = sectionChildren[i + 2];
            this.renderer.removeClass(active_section, 'active');
            this.renderer.removeClass(selected, 'active');
          }

          if (selected === event.srcElement) {
            const selected_text = event.srcElement.innerHTML;
            this.renderer.setProperty(button, 'innerHTML', selected_text);
            const selected_section = sectionChildren[i + 2];
            this.renderer.addClass(selected_section, 'active');
          }
       }

      // Activating
      this.renderer.addClass(event.srcElement, 'active');
    }
  }
}