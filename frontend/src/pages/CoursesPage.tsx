import { Container, Title, SimpleGrid, Card, Text, Badge, Button, Group, Progress, Loader } from '@mantine/core';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { coursesApi, type Course, type Lesson } from '../api/courses';
import { progressApi, type UserProgressSummary } from '../api/progress';

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [courseLessons, setCourseLessons] = useState<Record<number, Lesson[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load courses and progress in parallel
        const [coursesData, progressData] = await Promise.allSettled([
          coursesApi.getAllCourses(),
          progressApi.getMyProgress(),
        ]);

        if (coursesData.status === 'fulfilled') {
          setCourses(coursesData.value);

          // Load lessons for each course
          const lessonsMap: Record<number, Lesson[]> = {};
          const lessonPromises = coursesData.value
            .filter(c => c.totalLessons > 0)
            .map(async (course) => {
              try {
                const lessons = await coursesApi.getLessonsForCourse(course.id);
                lessonsMap[course.id] = lessons;
              } catch (e) {
                console.error(`Failed to load lessons for course ${course.id}:`, e);
              }
            });
          await Promise.all(lessonPromises);
          setCourseLessons(lessonsMap);
        }

        if (progressData.status === 'fulfilled') {
          setCompletedLessonIds(progressData.value.completedLessonIds);
          // Cache
          localStorage.setItem('completedLessons', JSON.stringify(progressData.value.completedLessonIds));
        } else {
          // Fallback
          setCompletedLessonIds(JSON.parse(localStorage.getItem('completedLessons') || '[]'));
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Container size="lg" py="xl" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader color="green" />
        <Text ml="md" c="green">Загрузка доступных операций...</Text>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2} c="green" className="glitch" data-text="// ДОСТУПНЫЕ ОПЕРАЦИИ">
          // ДОСТУПНЫЕ ОПЕРАЦИИ
        </Title>
        <Button variant="outline" color="green" component={Link} to="/">← В главный терминал</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {courses.map((course, index) => {
          const lessons = courseLessons[course.id] || [];
          const completedCount = lessons.filter(l => completedLessonIds.includes(l.id)).length;
          const progressPercent = course.totalLessons > 0 ? (completedCount / course.totalLessons) * 100 : 0;

          // Find the first uncompleted lesson to link to
          const firstUncompletedLesson = lessons.find(l => !completedLessonIds.includes(l.id));
          const firstLesson = lessons.length > 0 ? lessons[0] : null;
          const targetLesson = firstUncompletedLesson || firstLesson;
          const buttonLink = targetLesson ? `/lesson/${targetLesson.id}` : '#';

          const buttonText = completedCount === 0
            ? "НАЧАТЬ ОПЕРАЦИЮ"
            : completedCount >= course.totalLessons
              ? "✓ ЗАВЕРШЕНО"
              : "ПРОДОЛЖИТЬ";

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <Card shadow="md" padding="lg" bg="#0a0a0a" className="cyber-card" style={{ borderColor: '#1a1a1a', borderWidth: '1px' }}>
                <Group justify="space-between" mt="md" mb="xs">
                  <Text fw={700} c="green">{course.title}</Text>
                  <Badge color={course.color} variant="filled">{course.level}</Badge>
                </Group>

                <Text size="sm" c="dimmed" mb="md" style={{ minHeight: 60 }}>
                  {course.description}
                </Text>

                <Text size="xs" c="dimmed" mb={5}>Прогресс выполнения: {completedCount} / {course.totalLessons}</Text>
                <Progress value={progressPercent} color={course.color} size="sm" mb="md" />

                <Button
                  component={Link}
                  to={buttonLink}
                  disabled={course.totalLessons === 0}
                  fullWidth
                  color={course.color}
                  variant={completedCount >= course.totalLessons && course.totalLessons > 0 ? 'light' : 'filled'}
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