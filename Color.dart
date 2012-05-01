class Color {
  final double alpha;
  final int r, g, b;
  const Color(this.r, this.g, this.b, this.alpha);
  
  double get dr() {
    return r/255;
  }
  double get dg() {
    return g/255;
  }
  double get db() {
    return b/255;
  }
}
