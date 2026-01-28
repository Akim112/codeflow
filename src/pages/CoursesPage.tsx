import { Container, Title, SimpleGrid, Card, Text, Badge, Button, Group, Progress } from '@mantine/core';
import { Link } from 'react-router-dom';
import { courses, lessons } from '../data/lessons';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const CoursesPage = () => {
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  useEffect(() => {
    const savedProgress = localStorage.getItem('completedLessons');
    if (savedProgress) {
      setCompletedLessons(JSON.parse(savedProgress));
    }
  }, []);

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2} c="green">// ДОСТУПНЫЕ ОПЕРАЦИИ</Title>
        <Button variant="outline" component={Link} to="/">← В главный терминал</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {courses.map((course, index) => {
          // Расчет прогресса (остается без изменений)
          const completedCount = lessons.filter(lesson => 
            lesson.courseId === course.id && completedLessons.includes(lesson.id)
          ).length;
          const progressPercent = course.totalLessons > 0 ? (completedCount / course.totalLessons) * 100 : 0;

          // --- НОВАЯ УМНАЯ ЛОГИКА ДЛЯ КНОПКИ ---
          // 1. Находим все уроки, относящиеся к этому курсу
          const lessonsInCourse = lessons.filter(l => l.courseId === course.id);

          // 2. Находим первый урок, которого НЕТ в списке пройденных
          const nextLesson = lessonsInCourse.find(l => !completedLessons.includes(l.id));

          // 3. Определяем, куда вести пользователя
          const isCourseCompleted = !nextLesson; // Если следующий урок не найден, курс пройден
          const buttonLink = isCourseCompleted ? "#" : `/lesson/${nextLesson.id}`;
          const buttonText = isCourseCompleted ? "ОПЕРАЦИЯ ЗАВЕРШЕНА" : "ПРОДОЛЖИТЬ ОПЕРАЦИЮ";
          // --- КОНЕЦ НОВОЙ ЛОГИКИ ---

          return (
            <motion.div
              key={course.id} 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <Card shadow="md" padding="lg" withBorder>
                <Group justify="space-between" mt="md" mb="xs">
                  <Text fw={700}>{course.title}</Text>
                  <Badge color={course.color} variant="filled">{course.level}</Badge>
                </Group>

                <Text size="sm" c="dimmed" mb="md" style={{ minHeight: 60 }}>
                  {course.desc}
                </Text>

                <Text size="xs" c="dimmed" mb={5}>Прогресс выполнения: {completedCount} / {course.totalLessons}</Text>
                <Progress value={progressPercent} color={course.color} size="sm" mb="md" animated />

                <Button 
                  component={Link} 
                  to={buttonLink} 
                  disabled={isCourseCompleted || course.totalLessons === 0}
                  fullWidth
                  variant={isCourseCompleted ? "default" : "filled"}
                >
                  {course.totalLessons === 0 ? "СКОРО В СЕТИ" : buttonText}
                </Button>
              </Card>
            </motion.div>
          );
        })}
      </SimpleGrid>
    </Container>
  );
};

export default CoursesPage;