import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { PlainResume } from './resumeText'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica', color: '#111' },
  header: { marginBottom: 16 },
  name: { fontSize: 18, fontFamily: 'Helvetica-Bold' },
  role: { fontSize: 11, color: '#444', marginTop: 2 },
  section: { marginTop: 14 },
  sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  paragraph: { lineHeight: 1.5 },
  bullet: { flexDirection: 'row', marginBottom: 4 },
  bulletDot: { width: 10 },
  bulletText: { flex: 1, lineHeight: 1.4 },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillChip: { border: '1 solid #ccc', borderRadius: 3, paddingVertical: 2, paddingHorizontal: 6, fontSize: 9 },
})

type Props = {
  plain: PlainResume
  candidateName: string
  vacancyTitle: string
  company: string
}

export default function ResumePdfDocument({ plain, candidateName, vacancyTitle, company }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{candidateName}</Text>
          <Text style={styles.role}>
            Под вакансию: {vacancyTitle} · {company}
          </Text>
        </View>

        {plain.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>О себе</Text>
            <Text style={styles.paragraph}>{plain.summary}</Text>
          </View>
        )}

        {plain.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Опыт</Text>
            {plain.experience.map((line, i) => (
              <View key={i} style={styles.bullet}>
                <Text style={styles.bulletDot}>—</Text>
                <Text style={styles.bulletText}>{line}</Text>
              </View>
            ))}
          </View>
        )}

        {plain.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Навыки</Text>
            <View style={styles.skills}>
              {plain.skills.map((skill, i) => (
                <Text key={i} style={styles.skillChip}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  )
}
