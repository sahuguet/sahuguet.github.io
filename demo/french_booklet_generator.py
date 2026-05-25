#!/usr/bin/env python3
"""
French Learning Booklet Generator
Converts vocabulary and sentences into a printable PDF booklet.

Usage:
    python french_booklet_generator.py --vocab french_words.csv --sentences sentences.txt --layout vocab-sentences

    Or edit VOCAB and SENTENCES below and run: python french_booklet_generator.py
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
import csv
import sys

# ===== EDIT THESE TO ADD YOUR CONTENT =====

VOCAB = [
    {"fr": "chat", "en": "cat"},
    {"fr": "chien", "en": "dog"},
    {"fr": "maison", "en": "house"},
    {"fr": "école", "en": "school"},
    {"fr": "livre", "en": "book"},
]

SENTENCES = [
    "Je vois un chat noir.",
    "Mon chien est très gentil.",
    "J'aime ma maison.",
    "L'école est grande et belle.",
    "Je lis un livre intéressant.",
]

LAYOUT = "vocab-sentences"  # Options: vocab-sentences, flashcard, exercises

# ==========================================

class FrenchBookletGenerator:
    def __init__(self, vocab, sentences, layout="vocab-sentences"):
        self.vocab = vocab
        self.sentences = sentences
        self.layout = layout
        self.booklet_size = (5.5 * inch, 8.5 * inch)  # Half-letter size
        self.output_file = f"french_booklet_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

    def generate(self):
        """Generate the PDF booklet"""
        doc = SimpleDocTemplate(
            self.output_file,
            pagesize=self.booklet_size,
            rightMargin=0.25*inch,
            leftMargin=0.25*inch,
            topMargin=0.25*inch,
            bottomMargin=0.25*inch
        )

        styles = getSampleStyleSheet()
        story = []

        if self.layout == "vocab-sentences":
            story = self._build_vocab_sentences_layout(styles)
        elif self.layout == "flashcard":
            story = self._build_flashcard_layout(styles)
        elif self.layout == "exercises":
            story = self._build_exercises_layout(styles)

        doc.build(story)
        print(f"✓ Booklet generated: {self.output_file}")
        return self.output_file

    def _build_vocab_sentences_layout(self, styles):
        """Create pages with vocabulary + sentences + writing prompts"""
        story = []
        items_per_page = 4

        for i in range(0, len(self.vocab), items_per_page):
            page_vocab = self.vocab[i:i+items_per_page]
            page_sentences = self.sentences[i:min(i+2, len(self.sentences))]

            # Title
            title = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading2'],
                fontSize=16,
                textColor=colors.HexColor('#0066cc'),
                spaceAfter=8,
                fontName='Helvetica-Bold'
            )
            story.append(Paragraph("Vocabulary", title))

            # Vocabulary grid (2 columns)
            vocab_data = [["French", "English"]]
            for v in page_vocab:
                vocab_data.append([
                    f"<b>{v['fr']}</b>",
                    v['en']
                ])

            vocab_table = Table(vocab_data, colWidths=[2*inch, 2.5*inch])
            vocab_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e6f1fb')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0066cc')),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
            ]))
            story.append(vocab_table)
            story.append(Spacer(1, 0.2*inch))

            # Sentences
            sentence_style = ParagraphStyle(
                'Sentence',
                parent=styles['Normal'],
                fontSize=10,
                textColor=colors.HexColor('#333333'),
                leftIndent=10,
                spaceAfter=6
            )
            story.append(Paragraph("<b>Example sentences:</b>", styles['Heading3']))
            for sent in page_sentences:
                story.append(Paragraph(f"<i>{sent}</i>", sentence_style))

            story.append(Spacer(1, 0.15*inch))

            # Writing prompt
            prompt_style = ParagraphStyle(
                'Prompt',
                parent=styles['Normal'],
                fontSize=9,
                textColor=colors.HexColor('#999999'),
                italic=True
            )
            story.append(Paragraph("Write your own sentences using these words:", prompt_style))

            # Blank lines for writing
            for _ in range(3):
                story.append(Spacer(1, 0.08*inch))
                story.append(Paragraph("_" * 60, styles['Normal']))

            story.append(PageBreak())

        return story

    def _build_flashcard_layout(self, styles):
        """Create fold-able flashcard pages"""
        story = []
        items_per_page = 3

        for i in range(0, len(self.vocab), items_per_page):
            page_vocab = self.vocab[i:i+items_per_page]

            for v in page_vocab:
                # Card container
                card_data = [[
                    Paragraph(f"<b style='font-size:18px; color:#0066cc'>{v['fr']}</b><br/><br/>", styles['Normal']),
                ]]

                card_table = Table(card_data, colWidths=[5*inch])
                card_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0f0f0')),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('TOPPADDING', (0, 0), (-1, -1), 30),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 30),
                    ('BORDER', (0, 0), (-1, -1), 1, colors.black),
                ]))
                story.append(card_table)

                # Fold line
                story.append(Spacer(1, 0.1*inch))
                story.append(Paragraph("<div style='text-align:center; font-size:8px; color:#999999'>← Fold here →</div>", styles['Normal']))
                story.append(Spacer(1, 0.1*inch))

                # Answer
                answer_data = [[
                    Paragraph(f"<b>{v['en']}</b>", styles['Normal']),
                ]]

                answer_table = Table(answer_data, colWidths=[5*inch])
                answer_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#ffffcc')),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('TOPPADDING', (0, 0), (-1, -1), 20),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 20),
                    ('BORDER', (0, 0), (-1, -1), 0.5, colors.grey),
                ]))
                story.append(answer_table)
                story.append(Spacer(1, 0.3*inch))

            story.append(PageBreak())

        return story

    def _build_exercises_layout(self, styles):
        """Create fill-in-the-blank exercise pages"""
        story = []

        story.append(Paragraph("<b>Fill in the blanks</b>", styles['Heading2']))
        story.append(Spacer(1, 0.2*inch))

        for idx, sent in enumerate(self.sentences[:5], 1):
            words = sent.split()
            blank_idx = idx % len(words)

            # Create sentence with one blank
            sentence_parts = []
            for i, word in enumerate(words):
                if i == blank_idx:
                    sentence_parts.append("_______")
                else:
                    sentence_parts.append(word)

            exercise_text = f"<b>{idx}.</b> {' '.join(sentence_parts)}"
            story.append(Paragraph(exercise_text, styles['Normal']))
            story.append(Spacer(1, 0.15*inch))

        story.append(Spacer(1, 0.3*inch))
        story.append(Paragraph("<b>Answer key</b>", styles['Heading3']))
        story.append(Spacer(1, 0.1*inch))

        for idx, sent in enumerate(self.sentences[:5], 1):
            answer_text = f"<b>{idx}.</b> {sent}"
            story.append(Paragraph(answer_text, styles['Normal']))
            story.append(Spacer(1, 0.1*inch))

        return story


def load_from_csv(filepath):
    """Load vocabulary from CSV (columns: French, English)"""
    vocab = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            vocab.append({
                'fr': row.get('French') or row.get('french'),
                'en': row.get('English') or row.get('english')
            })
    return vocab


def load_from_txt(filepath):
    """Load sentences from text file (one per line)"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return [line.strip() for line in f if line.strip()]


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate a French learning booklet PDF")
    parser.add_argument("--vocab", help="CSV file with vocabulary (columns: French, English)")
    parser.add_argument("--sentences", help="Text file with sentences (one per line)")
    parser.add_argument("--layout", choices=["vocab-sentences", "flashcard", "exercises"],
                       default="vocab-sentences", help="Booklet layout style")

    args = parser.parse_args()

    vocab = VOCAB
    sentences = SENTENCES
    layout = LAYOUT

    if args.vocab:
        vocab = load_from_csv(args.vocab)
    if args.sentences:
        sentences = load_from_txt(args.sentences)
    if args.layout:
        layout = args.layout

    generator = FrenchBookletGenerator(vocab, sentences, layout)
    generator.generate()
