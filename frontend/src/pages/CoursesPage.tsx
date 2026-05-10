import { Container, Title, SimpleGrid, Card, Text, Badge, Button, Group, Progress } from '@mantine/core';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { api, syncServerStateToLocalStorage, type CourseDto, type LessonDto } from '../api';

const CoursesPage = () => {
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [lessonsByCourse, setLessonsByCourse] = useState<Record<number, LessonDto[]>>({});

  useEffect(() => {
    const load = async () => {
      try {
        await syncServerStateToLocalStorage();
      } catch {
        // fallback to local cache
      }

      const savedProgress = localStorage.getItem('completedLessons');
      if (savedProgress) setCompletedLessons(JSON.parse(savedProgress));

      const loadedCourses = await api.getCourses();
      setCourses(loadedCourses);

      const pairs = await Promise.all(
        loadedCourses.map(async (c) => [c.id, await api.getCourseLessons(c.id)] as const)
      );
      setLessonsByCourse(Object.fromEntries(pairs));
    };

    load().catch(console.error);
  }, []);

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2} c="green">// ДОСТУПНЫЕ ОПЕРАЦИИ</Title>
        <Button variant="outline" component={Link} to="/">← В главный терминал</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {courses.map((course, index) => {
          const lessonsInCourse = lessonsByCourse[course.id] || [];
          const completedCount = lessonsInCourse.filter((lesson) => completedLessons.includes(lesson.id)).length;
          const progressPercent = course.totalLessons > 0 ? (completedCount / course.totalLessons) * 100 : 0;
          const nextLesson = lessonsInCourse.find((l) => !completedLessons.includes(l.id));
          const isCourseCompleted = !nextLesson && lessonsInCourse.length > 0;
          const buttonLink = isCourseCompleted ? '#' : `/lesson/${nextLesson?.id ?? ''}`;
          const buttonText = isCourseCompleted ? 'ОПЕРАЦИЯ ЗАВЕРШЕНА' : 'ПРОДОЛЖИТЬ ОПЕРАЦИЮ';

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
                  {course.description}
                </Text>

                <Text size="xs" c="dimmed" mb={5}>Прогресс выполнения: {completedCount} / {course.totalLessons}</Text>
                <Progress value={progressPercent} color={course.color} size="sm" mb="md" animated />

                <Button
                  component={Link}
                  to={buttonLink}
                  disabled={isCourseCompleted || course.totalLessons === 0 || !nextLesson}
                  fullWidth
                  variant={isCourseCompleted ? 'default' : 'filled'}
                >
                  {course.totalLessons === 0 ? 'СКОРО В СЕТИ' : buttonText}
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
