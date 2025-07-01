import React from 'react';
import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';

export default Paginator = ({ data, scrollX }) => {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      {data.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 20, 10],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={i.toString()}
            style={[styles.dot, { width: dotWidth }]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 64,
    justifyContent: 'center', 
    alignItems: 'center',     
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
    backgroundColor: '#493d8a',
  },
});
