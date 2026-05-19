/* ============================================================
   QUIZ ATTACHÉ TERRITORIAL — ui.js
   Fonctions de rendu DOM (écrans, options, résultats)
   ============================================================ */
'use strict';

const UI = (() => {

  /* ---- Changement d'écran ---- */

  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');
  }

  /* ---- Écran d'accueil ---- */

  function renderThemes(chapters, selectedId, unseenCountFn) {
    const grid = document.getElementById('themes-grid');
    if (!grid) return;
    grid.innerHTML = chapters.map(ch => {
      const unseen = unseenCountFn ? unseenCountFn(ch.id) : 0;
      const isSelected = ch.id === selectedId;
      return `
        <button class="theme-chip${isSelected ? ' selected' : ''}" data-chapter="${ch.id}">
          <span class="theme-chip-icon">${ch.icon || '📚'}</span>
          <span class="theme-chip-info">
            <span class="theme-chip-title">${ch.title}</span>
            ${unseen > 0 ? `<span class="theme-chip-count">${unseen} nouvelles</span>` : ''}
          </span>
          <span class="theme-chip-check">✓</span>
        </button>
      `;
    }).join('');
  }

  function updateAvailableCounter(count) {
    const el = document.getElementById('available-counter');
    if (el) el.textContent = count > 0 ? `${count} questions disponibles` : '';
  }

  function setStartButton(enabled) {
    const btn = document.getElementById('btn-start');
    if (btn) btn.disabled = !enabled;
  }

  /* ---- Écran Quiz ---- */

  function renderQuestion(question, index, total) {
    const qEl = document.getElementById('quiz-question');
    if (qEl) qEl.textContent = question.q;

    const metaEl = document.getElementById('quiz-bloom');
    if (metaEl) {
      const bloom = Quiz.bloomLabel(question.bloom);
      metaEl.innerHTML = `<span class="bloom-badge bloom-${question.bloom}">${bloom}</span>`;
    }

    const counterEl = document.getElementById('header-counter');
    if (counterEl) counterEl.textContent = `${index + 1}/${total}`;

    const progressEl = document.getElementById('progress-fill');
    if (progressEl) progressEl.style.width = `${((index) / total) * 100}%`;
  }

  function renderOptions(options, selectedIndex) {
    const container = document.getElementById('quiz-options');
    if (!container) return;
    container.innerHTML = options.map((opt, i) => {
      const isSelected = i === selectedIndex;
      return `
        <button class="option-btn${isSelected ? ' selected' : ''}" data-index="${i}">
          <span class="option-letter">${String.fromCharCode(65 + i)}</span>
          <span class="option-text">${opt}</span>
        </button>
      `;
    }).join('');
  }

  function showFeedback(isCorrect, question, selectedIndex) {
    const options = document.querySelectorAll('.option-btn');
    options.forEach((btn, i) => {
      const idx = parseInt(btn.dataset.index);
      btn.classList.remove('selected');
      if (idx === question.answer) btn.classList.add('correct');
      if (idx === selectedIndex && !isCorrect) {
        btn.classList.add('wrong');
      }
      btn.disabled = true;
    });
  }

  function showSource(question) {
    const block = document.getElementById('source-block');
    if (!block) return;

    const hasExplanation = question && question.explanation;
    const hasContext = question && question.sourceContext;

    if (!hasExplanation && !hasContext) {
      block.style.display = 'none';
      return;
    }

    block.style.display = 'block';

    const sectionEl = document.getElementById('source-section-title');
    if (sectionEl) sectionEl.textContent = question.sectionTitle || '';

    // Nom du chapitre — chercher dans le pool le chapitre qui contient cette question
    const chapterEl = document.getElementById('source-chapter-title');
    if (chapterEl) {
      const pool = Store.get('pool');
      let chapterName = '';
      if (pool && question?.id) {
        for (const ch of pool.chapters) {
          if (ch.questions && ch.questions.some(q => q.id === question.id)) {
            chapterName = ch.title;
            break;
          }
        }
      }
      chapterEl.textContent = chapterName ? `📂 ${chapterName}` : '';
    }

    // Référence page (sourceLink) — filtrer les identifiants techniques #section-
    const refEl = document.getElementById('source-page-ref');
    if (refEl) {
      const link = question?.sourceLink || '';
      // Ne pas afficher les liens qui ne sont que des identifiants techniques (#section-...)
      const isTechnicalRef = link.startsWith('#section-') || link.startsWith('#chapitre-');
      refEl.textContent = (!isTechnicalRef && link) ? `🔗 ${link}` : '';
    }

    const extractEl = document.getElementById('source-extract-content');
    const extractBlock = document.getElementById('source-extract-block');
    if (hasContext) {
      if (extractEl) extractEl.innerHTML = question.sourceContext;
      if (extractBlock) extractBlock.style.display = 'block';
    } else {
      if (extractBlock) extractBlock.style.display = 'none';
    }

    const explEl = document.getElementById('source-explanation-content');
    const explBlock = document.getElementById('source-explanation-block');
    const divider = document.getElementById('source-divider');
    if (hasExplanation) {
      if (explEl) explEl.textContent = question.explanation;
      if (explBlock) explBlock.style.display = 'block';
      if (divider) divider.style.display = 'block';
    } else {
      if (explBlock) explBlock.style.display = 'none';
      if (divider) divider.style.display = 'none';
    }

    // Mots-clés
    const keywordsBlock = document.getElementById('source-keywords-block');
    const keywordsGrid = document.getElementById('source-keywords-grid');
    const hasKeywords = question && question.keywords && question.keywords.length > 0;
    if (hasKeywords && keywordsBlock && keywordsGrid) {
      keywordsBlock.style.display = 'block';
      keywordsGrid.innerHTML = question.keywords.map(kw => {
        const typeIcon = { concept: '📘', legal: '⚖️', institution: '🏛️', date: '📅', chiffre: '🔢' }[kw.type] || '📌';
        const refHtml = kw.ref ? `<span class="keyword-ref">${kw.ref}</span>` : '';
        return `<button class="keyword-chip" data-term="${kw.term}" title="Mot-clé : ${kw.term}">
          <span class="keyword-type">${typeIcon}</span>
          <span class="keyword-term">${kw.term}</span>
          ${refHtml}
        </button>`;
      }).join('');
      // Binder les mots-clés → ouvrir la modale
      keywordsGrid.querySelectorAll('.keyword-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          openSourceModal(question);
        });
      });
    } else if (keywordsBlock) {
      keywordsBlock.style.display = 'none';
    }
  }

  function setVerifyButton(enabled, text) {
    const btn = document.getElementById('btn-verify');
    if (btn) {
      btn.disabled = !enabled;
      if (text) btn.textContent = text;
    }
  }

  function updateLives(lives) {
    const container = document.getElementById('lives-container');
    if (!container) return;
    container.innerHTML = Array.from({ length: 3 }, (_, i) =>
      `<span class="life${i < lives ? '' : ' lost'}">❤️</span>`
    ).join('');
  }

  function showLoading(visible) {
    const existing = document.getElementById('loading-overlay');
    if (visible) {
      if (existing) return;
      const overlay = document.createElement('div');
      overlay.id = 'loading-overlay';
      overlay.className = 'loading-overlay';
      overlay.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Préparation de votre session...</div>
      `;
      document.body.appendChild(overlay);
    } else {
      if (existing) existing.remove();
    }
  }

  /* ---- Écran Résultats ---- */

  function renderResults(correct, wrong, total, maxStreak) {
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    const titleEl = document.getElementById('results-title');
    if (titleEl) {
      if (pct >= 80) titleEl.textContent = 'Bravo ! 🎉';
      else if (pct >= 50) titleEl.textContent = 'Pas mal ! 👍';
      else titleEl.textContent = 'Continue à réviser ! 💪';
    }

    const correctEl = document.getElementById('results-correct');
    if (correctEl) correctEl.textContent = correct;

    const wrongEl = document.getElementById('results-wrong');
    if (wrongEl) wrongEl.textContent = wrong;

    const pctEl = document.getElementById('results-pct');
    if (pctEl) pctEl.textContent = `${pct}%`;

    const streakEl = document.getElementById('results-streak');
    if (streakEl) streakEl.textContent = `${maxStreak}`;
  }

  function showPoolDoneBanner(visible) {
    const banner = document.getElementById('pool-done-banner');
    if (banner) banner.style.display = visible ? 'block' : 'none';
  }

  /* ============================================================
     MODALE SOURCE — Contexte intelligent & Mots-clés
     ============================================================ */

  /**
   * Découpe le contenu en paragraphes (séparés par \n\n).
   */
  function splitParagraphs(text) {
    return text.split(/\n{2,}/).map(p => p.trim()).filter(p => p.length > 0);
  }

  /**
   * Détecte si un paragraphe est un titre/nouveau sujet.
   * Un nouveau sujet commence par : "1.", "2.", "1.1.", "A.", "B.",
   * ou est très court (< 50 car) et ne contient pas de verbe conjugué.
   */
  function isNewTopic(paragraph) {
    const trimmed = paragraph.trim();
    // Titres numérotés
    if (/^\d+(\.\d+)*\.?\s/.test(trimmed)) return true;
    // Titres alphabétiques (A., B., etc.)
    if (/^[A-Z]\.\s/.test(trimmed)) return true;
    // Titres en gras ou très courts
    if (trimmed.length < 50 && !trimmed.includes(' ')) return true;
    // Lignes qui ressemblent à des titres (pas de verbe, pas de point final)
    if (trimmed.length < 60 && !trimmed.endsWith('.') && !trimmed.endsWith('?') && !trimmed.endsWith('!')) return true;
    return false;
  }

  /**
   * Normalise un texte pour la comparaison : supprime les espaces superflus,
   * normalise la ponctuation, met en minuscules.
   */
  function normalizeText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[«»""''„“‚‘]/g, '"')
      .replace(/[–—]/g, '-')
      .trim()
      .toLowerCase();
  }

  /**
   * Extrait le contexte intelligent autour de la phrase source.
   * Retourne { before, highlight, after } où chaque élément est du HTML.
   * La recherche est flexible : normalisation des espaces, casse, et fallback
   * sur les premiers mots significatifs si la correspondance exacte échoue.
   */
  function extractContext(fullContent, sourceText) {
    const paragraphs = splitParagraphs(fullContent);

    // Normaliser pour la recherche
    const normalizedSource = normalizeText(sourceText);

    // Trouver l'index du paragraphe contenant sourceText (recherche flexible)
    let sourceIdx = -1;
    let bestMatch = 0;

    for (let i = 0; i < paragraphs.length; i++) {
      const normalizedPara = normalizeText(paragraphs[i]);

      // 1. Correspondance exacte normalisée
      if (normalizedPara.includes(normalizedSource)) {
        sourceIdx = i;
        break;
      }

      // 2. Correspondance partielle : compter les mots communs
      const sourceWords = normalizedSource.split(/\s+/).filter(w => w.length > 3);
      const paraWords = normalizedPara.split(/\s+/);
      let matchCount = 0;
      for (const sw of sourceWords) {
        if (paraWords.some(pw => pw.includes(sw) || sw.includes(pw))) {
          matchCount++;
        }
      }
      const ratio = sourceWords.length > 0 ? matchCount / sourceWords.length : 0;
      if (ratio > 0.5 && ratio > bestMatch) {
        bestMatch = ratio;
        sourceIdx = i;
      }
    }

    // Si sourceText n'est pas trouvé, retourner tout le contenu
    if (sourceIdx === -1) {
      return {
        before: '',
        highlight: `<mark class="source-highlight">${escapeHtml(sourceText || fullContent)}</mark>`,
        after: ''
      };
    }

    // Paragraphes avant (max 2, mais on s'arrête si nouveau sujet)
    const beforeParagraphs = [];
    for (let i = sourceIdx - 1; i >= 0 && beforeParagraphs.length < 2; i--) {
      if (isNewTopic(paragraphs[i])) break;
      beforeParagraphs.unshift(paragraphs[i]);
    }

    // Paragraphes après (max 3, mais on s'arrête si nouveau sujet)
    const afterParagraphs = [];
    for (let i = sourceIdx + 1; i < paragraphs.length && afterParagraphs.length < 3; i++) {
      if (isNewTopic(paragraphs[i])) break;
      afterParagraphs.push(paragraphs[i]);
    }

    // Surligner la phrase source dans son paragraphe
    let highlightPara = paragraphs[sourceIdx];
    if (sourceText) {
      const escapedSource = sourceText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      highlightPara = highlightPara.replace(
        new RegExp(escapedSource, 'g'),
        `<mark class="source-highlight">${sourceText}</mark>`
      );
    }

    // Nettoyer les sauts de ligne internes aux paragraphes (hérités du formatage source)
    const cleanPara = (p) => escapeHtml(p).replace(/\n/g, ' ').replace(/\s{2,}/g, ' ');

    return {
      before: beforeParagraphs.map(p => `<div class="source-extract-context">${cleanPara(p)}</div>`).join(''),
      highlight: `<div class="source-extract-highlight">${highlightPara.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ')}</div>`,
      after: afterParagraphs.map(p => `<div class="source-extract-context">${cleanPara(p)}</div>`).join('')
    };
  }

  /**
   * Échappe le HTML pour éviter les injections XSS.
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Surligne tous les mots-clés dans un élément HTML.
   * Retourne le HTML avec les <mark> autour des termes.
   * N'utilise PAS \b pour ne pas couper les mots composés (ex: "clause générale de compétence").
   */
  function highlightKeywordsInHtml(html, keywords) {
    if (!keywords || keywords.length === 0) return html;
    let result = html;
    for (const kw of keywords) {
      const term = kw.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Utiliser une regex sans \b pour ne pas couper les mots composés
      // On cherche le terme précédé d'un début de chaîne ou d'un espace/punctuation
      const regex = new RegExp(`(^|[\\s,.;:!?\\-\\"'«»\\(\\[\\{])(\\s*)(${term})(\\s*)(?=[\\s,.;:!?\\-\\"'«»\\)\\]\\}]|$)`, 'gi');
      result = result.replace(regex, (match, before, wsBefore, word, wsAfter) => {
        return `${before}${wsBefore}<mark class="keyword-highlight">${word}</mark>${wsAfter}`;
      });
    }
    return result;
  }

  /**
   * Trouve le meilleur paragraphe d'explication pour un mot-clé donné.
   * Priorité : phrase source > paragraphe le plus long contenant le terme > première occurrence.
   */
  function findBestKeywordParagraph(paragraphs, term, sourceText) {
    // 1. Chercher dans la phrase source
    if (sourceText && sourceText.toLowerCase().includes(term.toLowerCase())) {
      return sourceText;
    }

    // 2. Chercher le paragraphe le plus long contenant le terme (susceptible d'être une explication)
    let best = null;
    let bestLen = 0;
    for (const p of paragraphs) {
      if (p.toLowerCase().includes(term.toLowerCase()) && p.length > bestLen) {
        best = p;
        bestLen = p.length;
      }
    }
    return best;
  }

  function openSourceModal(question) {
    const modal = document.getElementById('source-modal');
    if (!modal) return;

    const titleEl = document.getElementById('modal-section-title');
    if (titleEl) titleEl.textContent = question?.sectionTitle || 'Fiche source';

    // Récupérer la section entière du cours depuis le store
    const pool = Store.get('pool');
    let fullContent = '';
    let sectionKeywords = [];
    let sectionReferences = [];

    if (pool && question?.sectionId) {
      for (const ch of pool.chapters) {
        if (ch.sections && ch.sections[question.sectionId]) {
          const section = ch.sections[question.sectionId];
          fullContent = section.content || '';
          sectionKeywords = section.keywords || question.keywords || [];
          sectionReferences = section.references || question.references || [];
          break;
        }
      }
    }

    // Fallback
    if (!fullContent) {
      fullContent = question?.sourceText || question?.explanation || 'Aucune source disponible.';
    }

    // Construire le contenu de l'onglet Cours : TOUS les paragraphes de la section
    const sourceText = question?.sourceText || '';

    // DEBUG
    console.log('[openSourceModal] fullContent length:', fullContent.length);
    console.log('[openSourceModal] sourceText:', sourceText?.substring(0, 80));
    console.log('[openSourceModal] sectionId:', question?.sectionId);
    const allParagraphs = splitParagraphs(fullContent);
    console.log('[openSourceModal] allParagraphs count:', allParagraphs.length);
    if (allParagraphs.length > 0) {
      console.log('[openSourceModal] p0:', allParagraphs[0]?.substring(0, 80));
      console.log('[openSourceModal] p1:', allParagraphs[1]?.substring(0, 80));
    }

    let coursHtml = '';

    if (allParagraphs.length > 0) {
      // Afficher tous les paragraphes, avec le paragraphe source surligné
      const normalizedSource = normalizeText(sourceText);
      for (let i = 0; i < allParagraphs.length; i++) {
        const p = allParagraphs[i];
        const isSourcePara = normalizedSource && normalizeText(p).includes(normalizedSource);
        if (isSourcePara) console.log('[openSourceModal] source para found at index', i);

        // Nettoyer les sauts de ligne internes
        const cleanText = escapeHtml(p).replace(/\n/g, ' ').replace(/\s{2,}/g, ' ');

        if (isSourcePara) {
          // Paragraphe source : surligner la phrase exacte
          let highlighted = cleanText;
          if (sourceText) {
            const escapedSource = sourceText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            highlighted = highlighted.replace(
              new RegExp(escapedSource, 'g'),
              `<mark class="source-highlight">${escapeHtml(sourceText)}</mark>`
            );
          }
          coursHtml += `<p class="source-para">${highlighted}</p>`;
        } else {
          coursHtml += `<p>${cleanText}</p>`;
        }
      }
    } else {
      // Fallback
      coursHtml = `<p>${escapeHtml(fullContent)}</p>`;
    }

    // Surligner les mots-clés dans le texte du cours
    coursHtml = highlightKeywordsInHtml(coursHtml, sectionKeywords);

    // Construire le HTML de la modale
    const contentEl = document.getElementById('modal-content');
    if (contentEl) {
      let html = '';

      // Onglets
      html += `<div class="modal-tabs">
        <button class="tab-btn active" data-tab="cours">📖 Cours</button>
        <button class="tab-btn" data-tab="explication">💡 Explication</button>
        ${sectionKeywords.length > 0 ? '<button class="tab-btn" data-tab="mots-cles">🔑 Mots-clés</button>' : ''}
      </div>`;

      // Panneau Cours
      html += `<div class="tab-panel active" id="tab-cours">
        <div class="tab-panel-scroll">${coursHtml}</div>
      </div>`;

      // Panneau Explication
      html += `<div class="tab-panel" id="tab-explication" style="display:none;">
        <div class="tab-panel-scroll">
          <div class="explanation-enriched">
            <div class="explanation-section">
              <div class="explanation-label">✅ Pourquoi cette réponse est correcte</div>
              <div class="explanation-text">${question?.explanation || 'Aucune explication disponible.'}</div>
            </div>
            ${question?.wrongExplanation ? `
            <div class="explanation-section">
              <div class="explanation-label">❌ Pourquoi les autres réponses sont fausses</div>
              <div class="explanation-text">${question.wrongExplanation}</div>
            </div>` : ''}
            ${sectionReferences.length > 0 ? `
            <div class="explanation-section">
              <div class="explanation-label">📚 Références</div>
              <ul class="reference-list">
                ${sectionReferences.map(ref => `<li class="reference-item">${ref}</li>`).join('')}
              </ul>
            </div>` : ''}
          </div>
        </div>
      </div>`;

      // Panneau Mots-clés
      if (sectionKeywords.length > 0) {
        html += `<div class="tab-panel" id="tab-mots-cles" style="display:none;">
          <div class="tab-panel-scroll">
            <div class="keywords-grid">
              ${sectionKeywords.map(kw => `
                <button class="keyword-chip" data-term="${kw.term}" data-type="${kw.type}">
                  <span class="keyword-type">${kw.type === 'concept' ? '🔵' : kw.type === 'legal' ? '🟠' : kw.type === 'institution' ? '🏛️' : kw.type === 'date' ? '📅' : '🔢'}</span>
                  <span class="keyword-term">${kw.term}</span>
                  ${kw.ref ? `<span class="keyword-ref">${kw.ref}</span>` : ''}
                </button>
              `).join('')}
            </div>
          </div>
        </div>`;
      }

      contentEl.innerHTML = html;

      // Binder les onglets
      contentEl.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          contentEl.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          contentEl.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
          btn.classList.add('active');
          const tabId = document.getElementById('tab-' + btn.dataset.tab);
          if (tabId) tabId.style.display = 'block';
        });
      });

      // Binder les mots-clés → scroll vers le meilleur paragraphe d'explication
      contentEl.querySelectorAll('.keyword-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const term = chip.dataset.term;

          // Activer l'onglet Cours
          contentEl.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          contentEl.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
          const coursTab = contentEl.querySelector('[data-tab="cours"]');
          if (coursTab) coursTab.classList.add('active');
          const coursPanel = document.getElementById('tab-cours');
          if (!coursPanel) return;

          coursPanel.style.display = 'block';
          const scrollEl = coursPanel.querySelector('.tab-panel-scroll');
          if (!scrollEl) return;

          // Réinitialiser les surbrillances précédentes
          scrollEl.querySelectorAll('.keyword-highlight').forEach(el => {
            const parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
          });

          // Trouver le meilleur paragraphe pour ce mot-clé
          const bestPara = findBestKeywordParagraph(allParagraphs, term, sourceText);

          // Surligner TOUTES les occurrences du mot-clé dans le texte
          const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
          const walker = document.createTreeWalker(scrollEl, NodeFilter.SHOW_TEXT, null, false);
          const textNodes = [];
          while (walker.nextNode()) textNodes.push(walker.currentNode);

          let firstMatch = null;
          for (const node of textNodes) {
            const matches = node.textContent.match(regex);
            if (matches) {
              const span = document.createElement('span');
              span.innerHTML = node.textContent.replace(regex, '<mark class="keyword-highlight">$1</mark>');
              node.parentNode.replaceChild(span, node);

              if (!firstMatch) {
                firstMatch = span.querySelector('.keyword-highlight');
              }
            }
          }

          // Scroll vers l'occurrence la plus pertinente
          let target = null;
          if (bestPara) {
            // Chercher dans le scrollEl le texte du meilleur paragraphe
            const allHighlights = scrollEl.querySelectorAll('.keyword-highlight');
            for (const hl of allHighlights) {
              if (bestPara.includes(hl.textContent)) {
                target = hl;
                break;
              }
            }
          }

          if (!target && firstMatch) {
            target = firstMatch;
          }

          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Animation flash
            target.style.transition = 'background 0.5s';
            target.style.background = '#FFC800';
            setTimeout(() => {
              target.style.background = '';
            }, 800);
          }
        });
      });
    }

    modal.style.display = 'flex';
  }

  function closeSourceModal() {
    const modal = document.getElementById('source-modal');
    if (modal) modal.style.display = 'none';
  }

  return {
    showScreen,
    renderThemes,
    updateAvailableCounter,
    setStartButton,
    renderQuestion,
    renderOptions,
    showFeedback,
    showSource,
    setVerifyButton,
    updateLives,
    showLoading,
    renderResults,
    showPoolDoneBanner,
    openSourceModal,
    closeSourceModal
  };
})();
